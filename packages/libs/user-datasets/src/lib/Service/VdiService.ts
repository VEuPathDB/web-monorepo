import {
  createJsonRequest,
  createPlainTextRequest,
  FetchClientWithCredentials,
  ioTransformer,
} from '@veupathdb/http-utils';
import * as vdi from './model/response-decoders';
import * as req from './model/requests';
import * as io from 'io-ts';
import { VdiRoute } from './VdiRoute';
import { makeQueryString, QueryParams } from './utils/api-utils';
import { Consumer } from '../Utils';
import { sendMultipartRequest } from './utils/xhr';
import { BadUpload } from '../StoreModules/UserDatasetUploadStoreModule';
import {
  pluginListItem,
  VdiPluginConfig,
  ServerErrorBody,
} from './model/response-decoders';

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
    query?: QueryParams<vdi.GetDatasetsQueryParamEnum>
  ): Promise<Array<vdi.DatasetListEntry>> {
    const queryString = query ? makeQueryString(query) : '';

    return this.fetch(
      createJsonRequest({
        path: VdiRoute.DatasetListPath + queryString,
        method: 'GET',
        transformResponse: ioTransformer(io.array(vdi.datasetListEntry)),
      })
    );
  }

  async postDataset(
    details: req.DatasetPostDetails,
    uploads: DatasetUpload[],
    dispatchUploadProgress?: Consumer<number>,
    dispatchPageRedirect?: Consumer<vdi.DatasetPostResponseBody>,
    dispatchBadUpload?: Consumer<BadUpload>
  ) {
    await this.uploadDataset<vdi.DatasetPostResponse>(
      VdiRoute.DatasetListPath,
      'POST',
      details,
      uploads,
      ioTransformer(vdi.datasetPostResponse),
      dispatchUploadProgress
    ).then((res) => {
      if (dispatchPageRedirect && 'datasetId' in res) dispatchPageRedirect(res);
      else if (dispatchBadUpload && 'timestamp' in res) dispatchBadUpload(res);
    });
  }

  /**
   * Fetches available details about a dataset's metadata and processing
   * statuses.
   */
  async getDatasetDetails(
    id: vdi.DatasetId
  ): Promise<vdi.DatasetGetResponseBody> {
    return this.fetch(
      createJsonRequest({
        path: VdiRoute.datasetUri(id),
        method: 'GET',
        transformResponse: ioTransformer(vdi.datasetGetResponseBody),
      })
    );
  }

  /**
   * Updates a dataset's details based on the given patch body.
   */
  async patchDatasetDetails(
    id: vdi.DatasetId,
    body: req.DatasetPatchRequest
  ): Promise<void> {
    return this.fetch(
      createJsonRequest({
        path: VdiRoute.datasetUri(id),
        method: 'PATCH',
        body: body,
        transformResponse: VdiService.voidResponse,
      })
    );
  }

  /**
   * Uploads a new data revision for a target dataset.
   */
  async putDataset(
    id: vdi.DatasetId,
    details: req.DatasetPutRequestDetails,
    uploads: DatasetUpload[],
    dispatchUploadProgress?: Consumer<number>,
    dispatchPageRedirect?: Consumer<vdi.DatasetPutResponseBody>,
    dispatchBadUpload?: Consumer<BadUpload>
  ) {
    await this.uploadDataset(
      VdiRoute.datasetUri(id),
      'PUT',
      details,
      uploads,
      ioTransformer(vdi.datasetPostResponse),
      dispatchUploadProgress
    ).then((res) => {
      if (dispatchPageRedirect && 'datasetId' in res) dispatchPageRedirect(res);
      else if (dispatchBadUpload && 'timestamp' in res) dispatchBadUpload(res);
    });
  }

  /**
   * Marks a target dataset as deleted.
   */
  async deleteDataset(id: vdi.DatasetId): Promise<void> {
    return this.fetch(
      createPlainTextRequest({
        path: VdiRoute.datasetUri(id),
        method: 'DELETE',
        transformResponse: VdiService.voidResponse,
      })
    );
  }

  async getDatasetFileList(id: vdi.DatasetId): Promise<vdi.DatasetFileListing> {
    return this.fetch(
      createJsonRequest({
        path: VdiRoute.datasetFilesUri(id),
        method: 'GET',
        transformResponse: ioTransformer(vdi.datasetFileListing),
      })
    );
  }

  /**
   * Fetches a root level dataset file.
   *
   * The download flag does nothing for zip files.
   */
  async getDatasetRootFile(
    id: vdi.DatasetId,
    file: vdi.RootDatasetFile,
    download: boolean = true
  ): Promise<void | unknown> {
    const dlParam = download ? '' : '?download=false';
    return this.fetch(
      createPlainTextRequest({
        path: VdiRoute.datasetStaticFileUri(id, file) + dlParam,
        method: 'GET',
        transformResponse: VdiService.unknownBody,
      })
    );
  }

  async getDatasetDocumentFile(
    id: vdi.DatasetId,
    file: string
  ): Promise<void | unknown> {
    return this.fetch(
      createPlainTextRequest({
        path: VdiRoute.datasetDocumentFileUri(id, file),
        method: 'GET',
        transformResponse: VdiService.unknownBody,
      })
    );
  }

  async putDatasetDocumentFile(
    id: vdi.DatasetId,
    file: File,
    dispatchResponse?: (status: number, message?: string) => void
  ): Promise<void> {
    await this.uploadFile(
      VdiRoute.datasetDocumentFileUri(id, file.name),
      file,
      dispatchResponse
    );
  }

  async getDatasetVarPropsFile(
    id: vdi.DatasetId,
    file: string,
    download: boolean = true
  ): Promise<void | unknown> {
    const dlParam = download ? '' : '?download=false';
    return this.fetch(
      createPlainTextRequest({
        path: VdiRoute.datasetVariablePropertiesFileUri(id, file) + dlParam,
        method: 'GET',
        transformResponse: VdiService.unknownBody,
      })
    );
  }

  async putDatasetVarPropsFile(
    id: vdi.DatasetId,
    file: File,
    dispatchResponse?: (status: number, message?: string) => void
  ): Promise<void> {
    await this.uploadFile(
      VdiRoute.datasetVariablePropertiesFileUri(id, file.name),
      file,
      dispatchResponse
    );
  }

  async putDatasetShareOffer(
    id: vdi.DatasetId,
    recipientUserId: number,
    action: vdi.ShareOfferAction
  ): Promise<void> {
    return this.fetch(
      createJsonRequest({
        path: VdiRoute.datasetShareUri(id, recipientUserId, 'offer'),
        method: 'PUT',
        body: { action },
        transformResponse: VdiService.voidResponse,
      })
    );
  }

  async putDatasetShareReceipt(
    id: vdi.DatasetId,
    recipientUserId: number,
    action: req.ShareReceiptAction
  ): Promise<void> {
    return this.fetch(
      createJsonRequest({
        path: VdiRoute.datasetShareUri(id, recipientUserId, 'receipt'),
        method: 'PUT',
        body: { action },
        transformResponse: VdiService.voidResponse,
      })
    );
  }

  async getCommunityDatasetList(): Promise<Array<vdi.DatasetListEntry>> {
    return this.fetch(
      createJsonRequest({
        path: VdiRoute.DatasetListPath + VdiRoute.CommunityPathSegment,
        method: 'GET',
        transformResponse: ioTransformer(io.array(vdi.datasetListEntry)),
      })
    );
  }

  async getUserMetadata(): Promise<vdi.UserMetadata> {
    return this.fetch(
      createJsonRequest({
        path: VdiRoute.UserMetadataPath,
        method: 'GET',
        transformResponse: ioTransformer(vdi.userMetadata),
      })
    );
  }

  async getUserShareOffers(): Promise<Array<vdi.ShareOfferListEntry>> {
    return this.fetch(
      createJsonRequest({
        path: VdiRoute.UserShareOffersPath,
        method: 'GET',
        transformResponse: ioTransformer(io.array(vdi.shareOfferListEntry)),
      })
    );
  }

  /**
   * Fetches the public facing service configuration details.
   */
  async getServiceMetadata(): Promise<vdi.VdiServiceMetadata> {
    return this.fetch(
      createJsonRequest({
        path: VdiRoute.ServiceInfoPath,
        method: 'GET',
        transformResponse: ioTransformer(vdi.serviceMetadata),
      })
    );
  }

  async getPluginList(installTarget?: string): Promise<Array<VdiPluginConfig>> {
    return this.fetch(
      createJsonRequest({
        path:
          VdiRoute.PluginsPath +
          (installTarget ? `?${installTarget}=${installTarget}` : ''),
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
          fieldName: 'details',
          content: JSON.stringify(details),
        },
        ...uploads.map((u) => ({
          fieldName: u.type,
          content: u.type === 'url' ? u.url : u.file,
          fileName: u.type !== 'url' ? u.file.name : undefined,
        })),
      ],
      onResponse: async (code, type, response) => {
        if (type !== 'json') {
          console.error('unexpected server response: ', response);
          throw new Error(`unexpected server response with code ${code}`);
        }

        const body = await decoder(response);

        if (code >= 500) {
          throw new Error(
            (body as ServerErrorBody).message ?? 'unhandled server exception'
          );
        }

        if (code >= 200 && code < 300) return body as T;

        switch (code) {
          case 400:
            return {
              timestamp: Date.now(),
              type: 400,
              message:
                (body as vdi.SimpleServiceErrorBody).message ??
                'file upload failed',
            } as BadUpload;
          case 422:
            return {
              timestamp: Date.now(),
              type: 422,
              errors: (body as vdi.ValidationErrorBody).errors,
            } as BadUpload;
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
