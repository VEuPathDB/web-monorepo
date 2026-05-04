import { DatasetPostDetails } from '../model/requests';
import { DatasetUpload, VdiService } from '../VdiService';
import { Consumer } from '../../Utils';
import { DatasetPostResponseBody } from '../model/response-decoders';
import { BadUpload } from "../../StoreModules/UserDatasetUploadStoreModule";
import { DatasetUploads } from "../model/utility-types";

export interface NewDatasetSubmission {
  readonly service: VdiService;

  readonly onProgress?: Consumer<number>;
  readonly onSuccess?: Consumer<DatasetPostResponseBody>;
  readonly onError?: Consumer<BadUpload>;

  readonly details: DatasetPostDetails;
  readonly uploads: DatasetUploads;
}

export async function submitNewDataset({
  service,
  details,
  uploads,
  ...req
}: NewDatasetSubmission) {
  const dataFiles = uploads.dataFiles?.map(convertDataFile) ?? [];

  const combinedUploads = uploads.url
    ? [convertUrl(uploads.url), ...dataFiles]
    : dataFiles;

  await service.postDataset(
    details,
    combinedUploads,
    req.onProgress,
    req.onSuccess,
    req.onError
  );
}

function convertDataFile(file: File): DatasetUpload {
  return { type: 'dataFile', file };
}

function convertUrl(url: string): DatasetUpload {
  return { type: 'url', url };
}
