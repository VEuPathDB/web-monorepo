import * as http from "@veupathdb/http-utils";
import * as api from "./Types";
import * as io from "io-ts";
import * as form from "../Components/UploadForm";
import * as util from "../Utils/upload-user-dataset";

const PathDatasets = "/datasets";

const datasetPath = (datasetId: string) => `${PathDatasets}/${datasetId}`;

export class VdiServiceApi extends http.FetchClientWithCredentials {
  public getDatasetList(
    installTarget?: string,
    ownership?: "any" | "owned" | "shared",
  ): Promise<api.DatasetListEntry[]> {
    return this.fetch(http.createJsonRequest({
      path: PathDatasets + this.makeQueryString({ installTarget, ownership }),
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

    xhr.upload.addEventListener('progress', e => {
      dispatchUploadProgress && dispatchUploadProgress(Math.floor((e.loaded / e.total) * 100))
    });

    xhr.addEventListener('readystatechange', () => {
      if (xhr.readyState !== XMLHttpRequest.DONE)
        return;

      if (xhr.status !== 202) {
        try {
          const { datasetId } = http.ioDecode(xhr.response, api.postDatasetSuccessResponse)
          dispatchUploadProgress && dispatchUploadProgress(null)
          dispatchPageRedirect && dispatchPageRedirect(datasetId);
        } finally {
          dispatchUploadProgress && dispatchUploadProgress(null)
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
        requestBody.append('dataFiles', uploadType.file, uploadType.file.name)
        break;
      case "url":
        requestBody.append('url', uploadType.url)
        break;
      case "result":
        // fallthrough;  TODO: why does the "result" type exist if we don't use it?
      default:
        throw new Error(`Tried to upload a dataset via an unrecognized upload method '${uploadType.type}'`);

    }

    const authHeaders = await this.findAuthorizationHeaders();

    xhr.open("POST", `${this.baseUrl}${PathDatasets}`, true);
    for (const name in authHeaders)
      xhr.setRequestHeader(name, authHeaders[name])
    xhr.send(requestBody);
  }

  public getDatasetById(datasetId: string): Promise<api.DatasetDetails> {
    return this.fetch(http.createJsonRequest({
      path: datasetPath(datasetId),
      method: "GET",
      transformResponse: http.ioTransformer(api.datasetDetails)
    }))
  }

  public patchDatasetById(datasetId: )

  private makeQueryString(params: { [k: string]: string | number | boolean | null | undefined }): string {
    let query = "";

    for (const key in params) {
      const value = params[key];

      if (value !== null && value !== undefined)
        query += `&${key}=${encodeURIComponent(value as string | number | boolean)}`;
    }

    return query.length === 0 ? "" : "?" + query.substring(1);
  }
}