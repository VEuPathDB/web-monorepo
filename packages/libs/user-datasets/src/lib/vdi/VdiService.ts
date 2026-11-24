import {
  createJsonRequest,
  createPlainTextRequest,
  FetchClientWithCredentials,
  fetchResponseBody,
  generateTraceidHeaderValue,
  ioTransformer,
} from '@veupathdb/http-utils';
import { submitAsForm } from '@veupathdb/wdk-client/lib/Utils/FormSubmitter';

import * as io from 'io-ts';

import VdiRoutes from './VdiRoutes';
import { makeQueryString, QueryParams } from '../Service/utils/api-utils';
import { BiConsumer, Consumer, Runnable } from '../Utils';
import { MultipartField, sendMultipartRequest } from '../Service/utils/multipart-xhr';
import { BadUpload } from '../StoreModules';

import { RootDatasetFile } from '../Service/Model/utility-types';
import {
  asyncXHR,
  XHRError,
  XHRErrorType,
  XHRResponseType,
} from '../Service/utils/async-xhr';
import {
  DatasetPatchRequest,
  DatasetPutDetails,
  DatasetUpload,
  GetDatasetsQueryParamEnum,
  PartialDatasetDetails, ShareReceiptAction, VDI_MULTIPART_URL,
} from './requests';
import {
  DatasetFileListing,
  DatasetId,
  DatasetPatchResponse,
  DatasetPostResponse,
  DatasetPostResponseBody,
  DatasetPropertiesDeleteResponse,
  DatasetPutResponseBody,
  GetDatasetListResponse, GetDatasetMetadataResponse,
  GetDatasetResponse, GetPluginListResponse,
  GetServiceMetadataResponse, GetUserMetadataResponse,
  ShareOfferAction,
  ShareOfferListEntry,
} from './responses';
import { getDatasetListResponse } from './responses/get-datasets-list';
import { datasetPostResponse } from './responses/post-datasets';
import { datasetGetResponse } from './responses/get-dataset-details';
import {
  ccValidationErrorBody,
  ServerErrorBody,
  SimpleServiceErrorBody,
  ValidationErrorBody,
} from './responses/shared/error-responses';
import { datasetPatchResponse } from './responses/patch-dataset';
import { datasetFileListing } from './responses/shared/dataset-files';
import { shareOfferListEntry } from './responses/shared/shares';
import { getMetadataResponse } from './responses/get-metadata-file';
import { serviceMetadataResponse } from './responses/get-service-metadata';
import { getPluginListResponse } from './responses/get-plugin-list';
import { getUserMetadataResponse } from './responses/get-user-metadata';

export default class VdiService extends FetchClientWithCredentials {
  get vdiServiceUrl(): string {
    return this.baseUrl;
  }

  /**
   * Fetches a list of the non-community datasets that are visible to the
   * current user.
   *
   * @param query Optional filters to limit the list results and reduce required
   * service processing time.
   */
  async getDatasetList(
    query?: QueryParams<GetDatasetsQueryParamEnum>
  ): Promise<GetDatasetListResponse> {
    const queryString = query ? makeQueryString(query) : '';

    return this.fetch(
      createJsonRequest({
        path: VdiRoutes.DatasetListPath + queryString,
        method: 'GET',
        transformResponse: ioTransformer(getDatasetListResponse),
      })
    );
  }

  async postDataset(
    details: PartialDatasetDetails,
    uploads: DatasetUpload[],
    dispatchUploadProgress?: Consumer<number>,
    dispatchPageRedirect?: Consumer<DatasetPostResponseBody>,
    dispatchBadUpload?: Consumer<BadUpload>
  ): Promise<DatasetId | BadUpload> {
    let result: DatasetPostResponse | BadUpload;
    try {
      result = await this.uploadDataset(
        VdiRoutes.DatasetListPath,
        'POST',
        details,
        uploads,
        ioTransformer(datasetPostResponse),
        dispatchUploadProgress
      );
    } catch (e: any) {
      console.error('failed to submit dataset upload', e);
      throw e;
    }

    if ('datasetId' in result) {
      dispatchPageRedirect?.(result);
      return result.datasetId;
    }

    dispatchBadUpload?.(result as BadUpload);
    return result as BadUpload;
  }

  /**
   * Fetches available details about a dataset's metadata and processing
   * statuses.
   */
  async getDatasetDetails(id: DatasetId): Promise<GetDatasetResponse> {
    const response = await window.fetch(new Request(
      this.baseUrl + VdiRoutes.datasetUri(id),
      {
        ...this.init,
        headers: {
          ...(await this.findAuthorizationHeaders()),
        },
      }
    ));

    if (response.headers.get('Content-Type') === 'application/json') {
      return await ioTransformer(datasetGetResponse)(await fetchResponseBody(response));
    }

    throw new Error("unexpected non-JSON response from VDI API");
  }

  /**
   * Updates a dataset's details based on the given patch body.
   */
  async patchDatasetDetails(
    id: DatasetId,
    body: DatasetPatchRequest,
    onSuccess?: Runnable,
    onBadRequest?: Consumer<ValidationErrorBody>,
    onError?: Consumer<SimpleServiceErrorBody | ServerErrorBody>
  ): Promise<DatasetPatchResponse> {
    // FIXME: the below is based on the FetchClient superclass fetch method
    //        implementation.  The superclass method could not be used as it
    //        does not allow for direct handling of error responses.
    const request = new Request(this.baseUrl + VdiRoutes.datasetUri(id), {
      ...this.init,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(await this.findAuthorizationHeaders()),
      },
      body: JSON.stringify(body),
    });

    if (this.includeTraceidHeader) {
      request.headers.set('traceid', generateTraceidHeaderValue());
    }

    const response = await window.fetch(request);

    if (response.ok) {
      onSuccess?.();
      return undefined; // 204
    }

    // input validation error
    if (response.status === 422) {
      const responseBody = await ioTransformer(ccValidationErrorBody)(
        await fetchResponseBody(response)
      );

      onBadRequest?.(responseBody);

      return responseBody;
    }

    const responseBody = await ioTransformer(datasetPatchResponse)(
      await fetchResponseBody(response)
    );

    // Cast because we have already ruled out 204 and 422 so can assume that
    // unless someone changed the decoders, there can be no other possible valid
    // response types.
    onError?.(responseBody as SimpleServiceErrorBody | ServerErrorBody);

    return responseBody;
  }

  /**
   * Uploads a new data revision for a target dataset.
   */
  async putDataset(
    id: DatasetId,
    details: DatasetPutDetails,
    uploads: ReadonlyArray<DatasetUpload>,
    dispatchUploadProgress?: Consumer<number>,
    dispatchPageRedirect?: Consumer<DatasetPutResponseBody>,
    dispatchBadUpload?: Consumer<BadUpload>
  ) {
    await this.uploadDataset(
      VdiRoutes.datasetUri(id),
      'PUT',
      details,
      uploads,
      ioTransformer(datasetPostResponse),
      dispatchUploadProgress
    ).then((res) => {
      if (dispatchPageRedirect && 'datasetId' in res) {
        dispatchPageRedirect(res);
      } else if (dispatchBadUpload && 'type' in res) {
        dispatchBadUpload(res);
      }
    });
  }

  /**
   * Marks a target dataset as deleted.
   */
  async deleteDataset(id: DatasetId): Promise<void> {
    return this.fetch(
      createPlainTextRequest({
        path: VdiRoutes.datasetUri(id),
        method: 'DELETE',
        transformResponse: VdiService.voidResponse,
      })
    );
  }

  async getDatasetFileList(id: DatasetId): Promise<DatasetFileListing> {
    return this.fetch(
      createJsonRequest({
        path: VdiRoutes.datasetFilesUri(id),
        method: 'GET',
        transformResponse: ioTransformer(datasetFileListing),
      })
    );
  }

  /**
   * Fetches a root level dataset file.
   *
   * The download flag does nothing for zip files.
   */
  async getDatasetRootFile(
    id: DatasetId,
    file: RootDatasetFile,
    download: boolean = true
  ): Promise<void> {
    const queryParams = download ? '' : '?download=false';
    submitAsForm({
      method: 'GET',
      action: `${this.baseUrl}${VdiRoutes.datasetStaticFileUri(
        id,
        file
      )}${queryParams}`,
      inputs: Object.fromEntries(await this.findAuthorizationQueryParams()),
    });
  }

  async getDatasetDocumentFile(id: DatasetId, file: string): Promise<void> {
    submitAsForm({
      method: 'GET',
      action: `${this.baseUrl}${VdiRoutes.datasetDocumentFileUri(id, file)}`,
      inputs: Object.fromEntries(await this.findAuthorizationQueryParams()),
    });
  }

  async putDatasetDocumentFile(
    id: DatasetId,
    file: File,
    onResponse?: (status: number, message?: string) => void,
    onProgress?: Consumer<number>
  ): Promise<void> {
    await this.uploadFile(
      VdiRoutes.datasetDocumentFileUri(id, file.name),
      file,
      'application/octet-stream',
      onResponse,
      onProgress
    );
  }

  async getDatasetVarPropsFile(
    id: DatasetId,
    file: string,
    download: boolean = true
  ): Promise<void> {
    const queryParams = download ? '' : '?download=false';
    submitAsForm({
      method: 'GET',
      action: `${this.baseUrl}${VdiRoutes.datasetPropertiesFileUri(
        id,
        file
      )}${queryParams}`,
      inputs: Object.fromEntries(await this.findAuthorizationQueryParams()),
    });
  }

  async putDatasetVarPropsFile(
    id: DatasetId,
    file: File,
    onResponse?: BiConsumer<number, string | undefined>,
    onProgress?: Consumer<number>,
    onFailure?: (error: Error) => void
  ): Promise<void> {
    await this.uploadFile(
      VdiRoutes.datasetPropertiesFileUri(id, file.name),
      file,
      'text/tab-separated-values',
      onResponse,
      onProgress,
      onFailure
    );
  }

  async deleteDatasetVarPropsFile(
    id: DatasetId,
    fileName: string
  ): Promise<DatasetPropertiesDeleteResponse> {
    const auth = await this.findAuthorizationHeaders();

    const response = await window.fetch(
      this.baseUrl + VdiRoutes.datasetPropertiesFileUri(id, fileName),
      {
        method: 'DELETE',
        headers: new Headers(auth),
      }
    );

    if (response.ok || response.status === 404) {
      return undefined;
    }

    const jsonBody =
      response.headers.get('Content-Type') === 'application/json'
        ? await response.json()
        : null;

    return jsonBody
      ? jsonBody
      : ({
          status: 'server-error',
          requestId: '',
          message: 'unknown service or connection error',
        } as ServerErrorBody);
  }

  async putDatasetShareOffer(
    id: DatasetId,
    recipientUserId: number,
    action: ShareOfferAction
  ): Promise<void> {
    return this.fetch(
      createJsonRequest({
        path: VdiRoutes.datasetShareUri(id, recipientUserId, 'offer'),
        method: 'PUT',
        body: { action },
        transformResponse: VdiService.voidResponse,
      })
    );
  }

  async putDatasetShareReceipt(
    id: DatasetId,
    recipientUserId: number,
    action: ShareReceiptAction
  ): Promise<void> {
    return this.fetch(
      createJsonRequest({
        path: VdiRoutes.datasetShareUri(id, recipientUserId, 'receipt'),
        method: 'PUT',
        body: { action },
        transformResponse: VdiService.voidResponse,
      })
    );
  }

  async getCommunityDatasetList(): Promise<GetDatasetListResponse> {
    return this.fetch(
      createJsonRequest({
        path: VdiRoutes.DatasetListPath + VdiRoutes.CommunityPathSegment,
        method: 'GET',
        transformResponse: ioTransformer(getDatasetListResponse),
      })
    );
  }

  async getUserMetadata(): Promise<GetUserMetadataResponse> {
    return this.fetch(
      createJsonRequest({
        path: VdiRoutes.UserMetadataPath,
        method: 'GET',
        transformResponse: ioTransformer(getUserMetadataResponse),
      })
    );
  }

  async getUserShareOffers(): Promise<Array<ShareOfferListEntry>> {
    return this.fetch(
      createJsonRequest({
        path: VdiRoutes.UserShareOffersPath,
        method: 'GET',
        transformResponse: ioTransformer(io.array(shareOfferListEntry)),
      })
    );
  }

  /**
   * Fetches the public facing service configuration details.
   */
  async getServiceMetadata(): Promise<GetServiceMetadataResponse> {
    return this.fetch(
      createJsonRequest({
        path: VdiRoutes.ServiceInfoPath,
        method: 'GET',
        transformResponse: ioTransformer(serviceMetadataResponse),
      })
    );
  }

  async getPluginList(installTarget?: string): Promise<GetPluginListResponse> {
    return this.fetch(
      createJsonRequest({
        path:
          VdiRoutes.PluginsPath +
          (installTarget ? `?install-target=${installTarget}` : ''),
        method: 'GET',
        transformResponse: ioTransformer(getPluginListResponse),
      })
    );
  }

  async getRawDatasetMetadata(
    datasetId: DatasetId,
    download: boolean
  ): Promise<GetDatasetMetadataResponse> {
    return this.fetch(
      createJsonRequest({
        path:
          VdiRoutes.datasetStaticFileUri(datasetId, 'vdi-meta.json') +
          `?download=${download}`,
        method: 'GET',
        transformResponse: ioTransformer(getMetadataResponse),
      })
    );
  }

  private async uploadDataset<T>(
    path: string,
    method: 'POST' | 'PUT',
    details: object,
    uploads: ReadonlyArray<DatasetUpload>,
    decoder: (value: unknown) => Promise<T>,
    onProgress?: (progress: number) => void
  ): Promise<T | BadUpload> {
    return await sendMultipartRequest({
      url: `${this.baseUrl}${path}`,
      method: method,
      headers: await this.findAuthorizationHeaders(),
      fields: [
        {
          type: 'json',
          fieldName: 'details',
          content: details,
        },
        ...uploads.map((u): MultipartField => {
          return u.type === VDI_MULTIPART_URL
            ? {
                type: VDI_MULTIPART_URL,
                fieldName: VDI_MULTIPART_URL,
                content: u.url,
              }
            : {
                type: 'file',
                fieldName: u.type,
                content: u.file,
                fileName: u.file.name,
              };
        }),
      ],
      onProgress: onProgress
        ? (loaded, total) => onProgress(Math.floor((loaded / total) * 100))
        : undefined,
    }).then(async (res) => {
      // Determine the raw parsed body first, without running it through the
      // success `decoder` - that decoder only understands the 2xx response
      // shape, and running it unconditionally against a 400/422/5xx body
      // (which has a different shape) throws before the status-code
      // branches below ever get a chance to run.
      let rawBody: unknown;
      let bodyIsValidJson = true;

      switch (res.responseType) {
        case XHRResponseType.JSON:
          rawBody = res.responseBody;
          break;
        case XHRResponseType.Text:
          try {
            rawBody = JSON.parse(res.responseBody);
          } catch (e) {
            bodyIsValidJson = false;
          }
          break;
        default:
          console.error('unexpected server response: ', res.response);
          throw new Error(
            `unexpected server response with code ${res.responseCode}`
          );
      }

      if (res.responseCode >= 200 && res.responseCode < 300) {
        return await decoder(rawBody);
      }

      // From here on this is a non-success response: use `rawBody` directly
      // rather than `decoder`, since decoder expects the success shape.
      const statusMessage = `request failed with status ${res.responseCode}`;

      if (res.responseCode >= 500) {
        throw new Error(
          bodyIsValidJson
            ? (rawBody as ServerErrorBody).message ??
              'unhandled server exception'
            : statusMessage
        );
      }

      switch (res.responseCode) {
        case 400:
          return {
            type: 400,
            message: bodyIsValidJson
              ? (rawBody as SimpleServiceErrorBody).message ??
                'file upload failed'
              : statusMessage,
          };
        case 422:
          return {
            type: 422,
            errors: bodyIsValidJson
              ? (rawBody as ValidationErrorBody).errors
              : { general: [statusMessage], byKey: {} },
          };
        default:
          console.error('unexpected server response: ', res.responseBody);
          throw new Error(
            `unexpected server response with code ${res.responseCode}`
          );
      }
    });
  }

  private async uploadFile(
    path: string,
    file: File,
    contentType: string,
    onResponse?: (status: number, message?: string) => void,
    onProgress?: Consumer<number>,
    onFailure?: (error: Error) => void
  ) {
    try {
      const auth = await this.findAuthorizationHeaders();

      const result = await asyncXHR({
        contentType,
        url: this.baseUrl + path,
        method: 'PUT',
        body: file,
        headers: auth,
        onProgress: onProgress
          ? (sent, total) => onProgress(Math.floor(sent / total) * 100)
          : undefined,
      });

      let message: string | undefined = undefined;

      switch (result.responseType) {
        case XHRResponseType.Text:
          message = result.responseBody;
          break;
        case XHRResponseType.JSON:
          message = result.responseBody['message'];
          break;
      }

      onResponse?.(result.responseCode, message);
    } catch (e: any) {
      let error: Error;

      if (!Object.hasOwn(e, 'url')) {
        switch ((e as XHRError).type) {
          case XHRErrorType.Abort:
            error = new Error('file upload aborted unexpectedly', { cause: e });
            break;
          case XHRErrorType.Timeout:
            error = new Error('file upload request timed out', { cause: e });
            break;
          case XHRErrorType.Error:
          default:
            error = new Error('unknown error', { cause: e });
            break;
        }
      } else {
        error = new Error('unknown error', { cause: e });
      }

      console.error(error);
      onFailure?.(error);
    }
  }

  // region Oddball Request Transformers

  private static async voidResponse(_: unknown) {}

  // endregion Oddball Request Transformers
}
