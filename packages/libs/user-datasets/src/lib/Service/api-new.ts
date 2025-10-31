import * as http from "@veupathdb/http-utils";
import * as api from "./Types";
import * as io from "io-ts";
import * as form from "../Components/UploadForm";
import * as util from "../Utils/upload-user-dataset";
import { ShareOfferAction } from "./Types";

export class VDIServiceClient extends http.FetchClientWithCredentials {
  private static readonly DatasetsPath = "/datasets";

  private static readonly MetadataPath = "/meta-info";

  private static readonly PluginsPath = "/plugins";

  private static readonly DatasetPath = (id: string) => VDIServiceClient.DatasetsPath + "/" + id;

  private static readonly DatasetFilesPath = (id: string) =>
    VDIServiceClient.DatasetsPath + "/" + id + "/files";

  private static readonly ShareOfferPath = (datasetId: string, recipientId: number) =>
    VDIServiceClient.DatasetsPath + "/" + datasetId + "/shares/" + recipientId.toString() + "/offer";

  /**
   * Fetches a list of datasets that are visible to the current user.
   *
   * @param installTarget Optional project id string used by the service to
   * filter results to only datasets belonging to the target project.
   *
   * @param ownership Optional filter to restrict returned datasets to only
   * those that are owned by the current user, or those that have been shared
   * with the current user.
   */
  public getDatasetList(
    installTarget?: string,
    ownership?: "any" | "owned" | "shared",
  ): Promise<api.DatasetListEntry[]> {
    return this.fetch(http.createJsonRequest({
      path: VDIServiceClient.DatasetsPath + this.makeQueryString({ installTarget, ownership }),
      method: "GET",
      transformResponse: http.ioTransformer(io.array(api.datasetsListEntry)),
    }));
  }

  public async postDatasetList(
    formData: form.FormSubmission,
    dispatchUploadProgress?: (progress: number | null) => void,
    dispatchPageRedirect?: (datasetId: string) => void,
    dispatchBadUpload?: (error: string) => void,
  ): Promise<void> {
    const { uploadMethod: uploadType, ...datasetDetails } =
      await util.makeNewUserDatasetConfig(this.wdkService, formData);

    datasetDetails.origin = "direct-upload";

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", e => {
      dispatchUploadProgress && dispatchUploadProgress(Math.floor((e.loaded / e.total) * 100));
    });

    xhr.addEventListener("readystatechange", () => {
      if (xhr.readyState !== XMLHttpRequest.DONE)
        return;

      if (xhr.status !== 202) {
        try {
          const { datasetId } = http.ioDecode(xhr.response, api.postDatasetSuccessResponse);
          dispatchUploadProgress && dispatchUploadProgress(null);
          dispatchPageRedirect && dispatchPageRedirect(datasetId);
        } finally {
          dispatchUploadProgress && dispatchUploadProgress(null);
        }
      } else if (xhr.status >= 400) {
        const error = new Error(xhr.response);
        dispatchUploadProgress && dispatchUploadProgress(null);
        dispatchBadUpload && dispatchBadUpload(String(error));
        this.onNonSuccessResponse?.(error);
      }
    });

    const requestBody = new FormData();

    requestBody.append("details", JSON.stringify(datasetDetails));

    switch (uploadType.type) {
      case "file":
        requestBody.append("dataFiles", uploadType.file, uploadType.file.name);
        break;
      case "url":
        requestBody.append("url", uploadType.url);
        break;
      case "result":
      // fallthrough;  TODO: why does the "result" type exist if we don't use it?
      default:
        throw new Error(`Tried to upload a dataset via an unrecognized upload method '${uploadType.type}'`);

    }

    const authHeaders = await this.findAuthorizationHeaders();

    xhr.open("POST", `${this.baseUrl}${VDIServiceClient.DatasetsPath}`, true);
    for (const name in authHeaders)
      xhr.setRequestHeader(name, authHeaders[name]);
    xhr.send(requestBody);
  }

  public getDataset(datasetId: string): Promise<api.DatasetDetails> {
    return this.fetch(http.createJsonRequest({
      path: VDIServiceClient.datasetPath(datasetId),
      method: "GET",
      transformResponse: http.ioTransformer(api.datasetDetails),
    }));
  }

  public deleteDataset(datasetId: string): Promise<null> {
    return this.fetch(http.createJsonRequest({
      path: VDIServiceClient.DatasetPath(datasetId),
      method: "DELETE",
      transformResponse: async (_: unknown) => null,
    }));
  }

  public getDatasetFiles(datasetId: string): Promise<api.DatasetFileListResponse> {
    return this.fetch(http.createJsonRequest({
      path: VDIServiceClient.DatasetFilesPath(datasetId),
      method: "GET",
      transformResponse: http.ioTransformer(api.datasetFileListResponse),
    }));
  }

  public putShareOffer(datasetId: string, recipientId: number, action: ShareOfferAction): Promise<null> {
    return this.fetch(http.createJsonRequest({
      path: VDIServiceClient.ShareOfferPath(datasetId, recipientId),
      method: "PATCH",
      body: { action } as api.ShareOfferPutRequest,
      transformResponse: async (_: unknown) => null,
    }));
  }

  /**
   * Fetch VDI service metadata such as the running version and configuration
   * options.
   */
  public getServiceMetadata(): Promise<api.ServiceMetadataResponseBody> {
    return this.fetch(http.createJsonRequest({
      path: VDIServiceClient.MetadataPath,
      method: "GET",
      transformResponse: http.ioTransformer(api.serviceMetadataResponseBody),
    }));
  }

  /**
   * Fetch the listing of dataset type handling plugins currently enabled in the
   * VDI service.
   *
   * @param installTarget Optional project id filter to limit the plugin list to
   * only plugins that are applicable to the target project.
   */
  public getPlugins(installTarget?: string): Promise<api.PluginDetailsResponse> {
    return this.fetch(http.createJsonRequest({
      path: VDIServiceClient.PluginsPath + this.makeQueryString({ installTarget }),
      method: "GET",
      transformResponse: http.ioTransformer(api.pluginDetailsResponse),
    }));
  }

  public patchDataset(datasetId: string, request: api.DatasetPatchRequest): Promise<void> {
    throw new Error("TODO"); // FIXME: todo
  }

  private makeQueryString(params: { [k: string]: string | number | boolean | null | undefined }): string {
    let query = "";

    for (const key in params) {
      const value = params[key];

      if (value !== null && value !== undefined)
        query += `&${key}=${encodeURIComponent(value as string | number | boolean)}`;
    }

    return query.length === 0 ? "" : "?" + query.substring(1);
  }

  private static datasetPath(datasetId: string): string {
    return `${VDIServiceClient.DatasetsPath}/${datasetId}`;
  }
}