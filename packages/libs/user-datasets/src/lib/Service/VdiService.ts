import {
  createJsonRequest,
  createPlainTextRequest,
  FetchClientWithCredentials,
  fetchResponseBody,
  generateTraceidHeaderValue,
  ioTransformer,
} from '@veupathdb/http-utils';

import * as io from 'io-ts';

import { VdiRoutes } from './VdiRoutes';
import { makeQueryString, QueryParams } from './utils/api-utils';
import { Consumer, Runnable } from '../Utils';
import { MultipartField, sendMultipartRequest } from './utils/xhr';
import { BadUpload } from '../StoreModules';

import {
  DatasetFileListing,
  DatasetGetResponseBody,
  DatasetId,
  DatasetListEntry,
  DatasetPatchRequest,
  DatasetPostDetails,
  DatasetPostResponseBody,
  DatasetPutDetails,
  DatasetPutResponseBody,
  ShareOfferAction,
  ShareOfferListEntry,
  VdiPluginConfig,
  VdiServiceMetadata,
  VdiUserMetadata,
} from './Model';

import {
  GetDatasetsQueryParamEnum,
  ShareReceiptAction,
} from './Model/request-types';

import {
  ccValidationErrorBody,
  datasetFileListing,
  datasetGetResponseBody,
  datasetListEntry,
  datasetPatchResponse,
  DatasetPatchResponse,
  datasetPostResponse,
  DatasetPostResponse,
  pluginListItem,
  ServerErrorBody,
  serviceMetadata,
  shareOfferListEntry,
  SimpleServiceErrorBody,
  userMetadata,
  ValidationErrorBody,
} from './Model/response-decoders';

import { RootDatasetFile } from './Model/utility-types';

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
    details: DatasetPostDetails,
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
  ): Promise<void | unknown> {
    const dlParam = download ? '' : '?download=false';
    return this.fetch(
      createPlainTextRequest({
        path: VdiRoutes.datasetStaticFileUri(id, file) + dlParam,
        method: 'GET',
        transformResponse: VdiService.unknownBody,
      })
    );
  }

  async getDatasetDocumentFile(
    id: DatasetId,
    file: string
  ): Promise<void | unknown> {
    return this.fetch(
      createPlainTextRequest({
        path: VdiRoutes.datasetDocumentFileUri(id, file),
        method: 'GET',
        transformResponse: VdiService.unknownBody,
      })
    );
  }

  async putDatasetDocumentFile(
    id: DatasetId,
    file: File,
    dispatchResponse?: (status: number, message?: string) => void
  ): Promise<void> {
    await this.uploadFile(
      VdiRoutes.datasetDocumentFileUri(id, file.name),
      file,
      dispatchResponse
    );
  }

  async getDatasetVarPropsFile(
    id: DatasetId,
    file: string,
    download: boolean = true
  ): Promise<void | unknown> {
    const dlParam = download ? '' : '?download=false';
    return this.fetch(
      createPlainTextRequest({
        path: VdiRoutes.datasetVariablePropertiesFileUri(id, file) + dlParam,
        method: 'GET',
        transformResponse: VdiService.unknownBody,
      })
    );
  }

  async putDatasetVarPropsFile(
    id: DatasetId,
    file: File,
    dispatchResponse?: (status: number, message?: string) => void
  ): Promise<void> {
    await this.uploadFile(
      VdiRoutes.datasetVariablePropertiesFileUri(id, file.name),
      file,
      dispatchResponse
    );
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
    method: string,
    details: object,
    uploads: DatasetUpload[],
    decoder: (value: unknown) => Promise<T>,
    onProgress?: (progress: number) => void
  ): Promise<T | BadUpload> {
    return await sendMultipartRequest<T | BadUpload>({
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
      onResponse: async (code, type, response) => {
        if (type !== 'json' && type !== '') {
          console.error('unexpected server response: ', response);
          throw new Error(`unexpected server response with code ${code}`);
        }

        const body = await decoder(
          type === '' && typeof response === 'string'
            ? JSON.parse(response)
            : response
        );

        if (code >= 500) {
          throw new Error(
            (body as ServerErrorBody).message ?? 'unhandled server exception'
          );
        }

        if (code >= 200 && code < 300) return body as T;

        switch (code) {
          case 400:
            return {
              type: 400,
              message:
                (body as SimpleServiceErrorBody).message ??
                'file upload failed',
            };
          case 422:
            return {
              type: 422,
              errors: (body as ValidationErrorBody).errors,
            };
          default:
            console.error('unexpected server response: ', response);
            throw new Error(`unexpected server response with code ${code}`);
        }
      },
      onProgress: onProgress
        ? (loaded, total) => onProgress(Math.floor((loaded / total) * 100))
        : undefined,
    });
  }

  private async uploadFile(
    path: string,
    file: File,
    dispatchResponse?: (status: number, message?: string) => void
  ) {
    const req = new XMLHttpRequest();

    req.addEventListener('readystatechange', () => {
      if (req.readyState !== XMLHttpRequest.DONE) return;

      switch (req.status) {
        case 204:
          dispatchResponse?.(204);
          break;
        case 400:
          if (req.getResponseHeader('Content-Type') === 'application/json') {
            const body = JSON.parse(req.responseText);
            dispatchResponse?.(400, body['message']);
            break;
          }

          dispatchResponse?.(400);
          break;
        default:
          dispatchResponse?.(req.status);
          break;
      }
    });

    const auth = await this.findAuthorizationHeaders();

    const stream = new FileReader();
    stream.onload = (e) => req.send(e.target?.result);

    req.open('POST', this.baseUrl + path);
    req.overrideMimeType('application/octet-stream');
    for (const key of Object.keys(auth)) req.setRequestHeader(key, auth[key]);

    stream.readAsBinaryString(file);
  }

  // region Oddball Request Transformers

  private static async unknownBody(body?: unknown): Promise<void | unknown> {
    if (body) return body;
    else return;
  }

  private static async voidResponse(_: unknown) {}

  // endregion Oddball Request Transformers
}
