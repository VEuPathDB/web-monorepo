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

import { VdiRoutes } from './VdiRoutes';
import { makeQueryString, QueryParams } from './utils/api-utils';
import { BiConsumer, Consumer, Runnable } from '../Utils';
import { MultipartField, sendMultipartRequest } from './utils/multipart-xhr';
import { BadUpload } from '../StoreModules';

import {
  DatasetFileListing,
  DatasetGetResponseBody,
  DatasetId,
  DatasetListEntry,
  DatasetPatchRequest,
  DatasetPatchResponse,
  PartialDatasetDetails,
  DatasetPostResponse,
  DatasetPostResponseBody,
  DatasetPropertiesDeleteResponse,
  DatasetPutDetails,
  DatasetPutResponseBody,
  GetDatasetsQueryParamEnum,
  ServerErrorBody,
  ShareOfferAction,
  ShareOfferListEntry,
  ShareReceiptAction,
  SimpleServiceErrorBody,
  ValidationErrorBody,
  VdiPluginConfig,
  VdiServiceMetadata,
  VdiUserMetadata,
} from './Model';

import {
  ccValidationErrorBody,
  datasetFileListing,
  datasetGetResponseBody,
  datasetListEntry,
  datasetPatchResponse,
  datasetPostResponse,
  pluginListItem,
  serviceMetadata,
  shareOfferListEntry,
  userMetadata,
} from './Model/response-decoders';

import { RootDatasetFile } from './Model/utility-types';
import {
  asyncXHR,
  XHRError,
  XHRErrorType,
  XHRResponseType,
} from './utils/async-xhr';

export type DatasetUploadFileType =
  | 'dataFile'
  | 'docFile'
  | 'dataPropertiesFile';

export type DatasetUpload =
  | { type: DatasetUploadFileType; file: File }
  | { type: 'url'; url: string };

export class VdiService extends FetchClientWithCredentials {
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
  ): Promise<Array<DatasetListEntry>> {
    const queryString = query ? makeQueryString(query) : '';

    return this.fetch(
      createJsonRequest({
        path: VdiRoutes.DatasetListPath + queryString,
        method: 'GET',
        transformResponse: ioTransformer(io.array(datasetListEntry)),
      })
    );
  }

  async postDataset(
    details: PartialDatasetDetails,
    uploads: DatasetUpload[],
    dispatchUploadProgress?: Consumer<number>,
    dispatchPageRedirect?: Consumer<DatasetPostResponseBody>,
    dispatchBadUpload?: Consumer<BadUpload>
  ) {
    await this.uploadDataset<DatasetPostResponse>(
      VdiRoutes.DatasetListPath,
      'POST',
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
   * Fetches available details about a dataset's metadata and processing
   * statuses.
   */
  async getDatasetDetails(id: DatasetId): Promise<DatasetGetResponseBody> {
    return this.fetch(
      createJsonRequest({
        path: VdiRoutes.datasetUri(id),
        method: 'GET',
        transformResponse: ioTransformer(datasetGetResponseBody),
      })
    );
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
    uploads: DatasetUpload[],
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

  async getCommunityDatasetList(): Promise<Array<DatasetListEntry>> {
    return this.fetch(
      createJsonRequest({
        path: VdiRoutes.DatasetListPath + VdiRoutes.CommunityPathSegment,
        method: 'GET',
        transformResponse: ioTransformer(io.array(datasetListEntry)),
      })
    );
  }

  async getUserMetadata(): Promise<VdiUserMetadata> {
    return this.fetch(
      createJsonRequest({
        path: VdiRoutes.UserMetadataPath,
        method: 'GET',
        transformResponse: ioTransformer(userMetadata),
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
  async getServiceMetadata(): Promise<VdiServiceMetadata> {
    return this.fetch(
      createJsonRequest({
        path: VdiRoutes.ServiceInfoPath,
        method: 'GET',
        transformResponse: ioTransformer(serviceMetadata),
      })
    );
  }

  async getPluginList(installTarget?: string): Promise<Array<VdiPluginConfig>> {
    return this.fetch(
      createJsonRequest({
        path:
          VdiRoutes.PluginsPath +
          (installTarget ? `?install-target=${installTarget}` : ''),
        method: 'GET',
        transformResponse: ioTransformer(io.array(pluginListItem)),
      })
    );
  }

  private async uploadDataset<T>(
    path: string,
    method: 'POST' | 'PUT',
    details: object,
    uploads: DatasetUpload[],
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
          return u.type === 'url'
            ? {
                type: 'url',
                fieldName: 'url',
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
      let body: T;

      switch (res.responseType) {
        case XHRResponseType.JSON:
          body = await decoder(res.responseBody);
          break;
        case XHRResponseType.Text:
          body = await decoder(JSON.parse(res.responseBody));
          break;
        default:
          console.error('unexpected server response: ', res.response);
          throw new Error(
            `unexpected server response with code ${res.responseCode}`
          );
      }

      if (res.responseCode >= 500) {
        throw new Error(
          (body as ServerErrorBody).message ?? 'unhandled server exception'
        );
      }

      if (res.responseCode >= 200 && res.responseCode < 300) {
        return body;
      }

      switch (res.responseCode) {
        case 400:
          return {
            type: 400,
            message:
              (body as SimpleServiceErrorBody).message ?? 'file upload failed',
          };
        case 422:
          return {
            type: 422,
            errors: (body as ValidationErrorBody).errors,
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
