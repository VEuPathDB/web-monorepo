import { DatasetUploadPageConfig } from './types';
import { DatasetInstaller, DisplayText } from "@veupathdb/web-common/src/user-dataset-upload-config";

export function makeDatasetUploadPageConfig(
  availableUploadTypes: DatasetInstaller[] = [],
  displayText: DisplayText,
): DatasetUploadPageConfig {
  return availableUploadTypes
    ? { hasDirectUpload: true, availableUploadTypes, displayText }
    : { hasDirectUpload: false, displayText };
}
