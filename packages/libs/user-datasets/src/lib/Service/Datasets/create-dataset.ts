import {
  PartialDatasetDetails,
  DatasetPostResponseBody,
  DatasetUploads,
} from '../Model';
import { DatasetUpload, VdiService } from '../VdiService';
import { BadUpload } from '../../StoreModules';
import { Consumer, Function } from '../../Utils';
import { sanitizeFileName } from '../utils/sanitization';
import { isNonBlankString } from '../../Utils/value-tests';
import { cleanDatasetDetails } from './payload-cleanup';

export interface NewDatasetSubmission {
  readonly service: VdiService;

  readonly onProgress?: Consumer<number>;
  readonly onSuccess?: Consumer<DatasetPostResponseBody>;
  readonly onError?: Consumer<BadUpload>;

  readonly details: PartialDatasetDetails;
  readonly uploads: DatasetUploads;
}

export async function submitNewDataset({
  service,
  details,
  uploads,
  ...req
}: NewDatasetSubmission) {
  const combinedUploads: DatasetUpload[] = [];

  if (isNonBlankString(uploads.url)) {
    combinedUploads.push(convertUrl(uploads.url));
  } else {
    appendFiles(uploads.dataFiles, convertDataFile, combinedUploads);
  }

  appendFiles(uploads.documentFiles, convertDocumentFile, combinedUploads);
  appendFiles(
    uploads.dataPropertiesFiles,
    convertPropertiesFile,
    combinedUploads
  );

  const scrubbedDetails = cleanDatasetDetails(details);

  await service.postDataset(
    scrubbedDetails,
    combinedUploads,
    req.onProgress,
    req.onSuccess,
    req.onError
  );
}

function appendFiles(
  fileList: FileList | undefined,
  converter: Function<File, DatasetUpload>,
  combinedUploads: DatasetUpload[]
) {
  if (fileList == null) {
    return;
  }

  for (const file of fileList) {
    combinedUploads.push(converter(sanitizeFileName(file)));
  }
}

function convertDocumentFile(file: File): DatasetUpload {
  return { type: 'docFile', file };
}

function convertPropertiesFile(file: File): DatasetUpload {
  return { type: 'dataPropertiesFile', file };
}

function convertDataFile(file: File): DatasetUpload {
  return { type: 'dataFile', file };
}

function convertUrl(url: string): DatasetUpload {
  return { type: 'url', url };
}
