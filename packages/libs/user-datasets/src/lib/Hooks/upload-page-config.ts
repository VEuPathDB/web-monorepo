import { DatasetUploadPageConfig } from "../Utils/types";
import { InputDatasetType } from "../Service/Types";
import {
  DisplayTextOverride,
  initDisplayText,
  useAllCompatibleInstallers,
} from "@veupathdb/web-common/src/user-dataset-upload-config";
import { makeDatasetUploadPageConfig } from "../Utils/upload-config";
import { equalTypes } from "../Utils/type-utils";

export const useUploadPageConfig = (displayTextOverride?: DisplayTextOverride): DatasetUploadPageConfig => {
  // Allow client config to override the service config.
  const enabledUploadTypes = process.env.REACT_APP_AVAILABLE_UPLOAD_TYPES
      ?.trim()
      ?.split(/\s*,\s*/g)
      // default all to version 1.0 since we don't currently have any other
      // versions.
      ?.map(name => ({ name, version: "1.0" } as InputDatasetType))
    ?? [];

  // Upload types configured in the service for the current project.
  const availableUploadTypes = useAllCompatibleInstallers();

  return makeDatasetUploadPageConfig(
    availableUploadTypes.filter(ct => enabledUploadTypes.find(et => equalTypes(ct.type, et))),
    displayTextOverride ? displayTextOverride(initDisplayText()) : initDisplayText(),
  );
};
