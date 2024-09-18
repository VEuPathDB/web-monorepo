import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { NewUserDataset, UserDatasetUpload } from '../Utils/types';
export interface ServiceConfig {
  datasetImportUrl: string;
  fullWdkServiceUrl: string;
}
export type UserDatasetUploadCompatibleWdkService = WdkService &
  {
    [Key in keyof UserDatasetUploadServiceWrappers]: ReturnType<
      UserDatasetUploadServiceWrappers[Key]
    >;
  };
type UserDatasetUploadServiceWrappers = ReturnType<
  typeof makeUserDatasetUploadServiceWrappers
>;
export declare const makeUserDatasetUploadServiceWrappers: ({
  datasetImportUrl,
  fullWdkServiceUrl,
}: ServiceConfig) => {
  datasetImportUrl: (wdkService: WdkService) => string;
  addDataset: (
    wdkService: WdkService
  ) => (newUserDataset: NewUserDataset) => Promise<void>;
  listStatusDetails: () => () => Promise<UserDatasetUpload[]>;
  cancelOngoingUpload: () => (jobId: string) => Promise<void>;
  clearMessages: () => (jobIds: string[]) => Promise<void>;
  getSupportedDatasetTypes: () => (projectId: string) => Promise<string[]>;
  getSupportedFileUploadTypes: () => (
    projectId: string,
    datasetType: string
  ) => Promise<string[]>;
};
export declare function isUserDatasetUploadCompatibleWdkService(
  wdkService: WdkService
): wdkService is UserDatasetUploadCompatibleWdkService;
export declare function assertIsUserDatasetUploadCompatibleWdkService(
  wdkService: WdkService
): asserts wdkService is UserDatasetUploadCompatibleWdkService;
export declare const MISCONFIGURED_USER_DATASET_UPLOAD_SERVICE_ERROR_MESSAGE =
  'In order to use this feature, a UserDatasetUploadCompatibleWdkService must be configured.';
export {};
//# sourceMappingURL=UserDatasetUploadWrappers.d.ts.map
