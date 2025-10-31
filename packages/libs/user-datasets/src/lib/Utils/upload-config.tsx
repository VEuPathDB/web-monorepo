import { DatasetUploadPageConfig } from './types';
import { DatasetInstaller } from "@veupathdb/web-common/src/user-dataset-upload-config";
import { VariableDisplayText } from "../Components/FormTypes";

export function makeDatasetUploadPageConfig(
  availableUploadTypes: DatasetInstaller[] = [],
  displayText: VariableDisplayText,
): DatasetUploadPageConfig {
  return availableUploadTypes
    ? { hasDirectUpload: true, availableUploadTypes, displayText }
    : { hasDirectUpload: false, displayText };
}
