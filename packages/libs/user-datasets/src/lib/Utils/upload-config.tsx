import { DatasetUploadPageConfig } from './types';
import { EnabledDatasetType } from "@veupathdb/web-common/src/user-dataset-upload-config";
import { VariableDisplayText } from "../Components/FormTypes";

export function makeDatasetUploadPageConfig(
  availableUploadTypes: EnabledDatasetType[] = [],
  displayText: VariableDisplayText,
): DatasetUploadPageConfig {
  return availableUploadTypes
    ? { hasDirectUpload: true, availableUploadTypes }
    : { hasDirectUpload: false };
}
