import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { EpicDependencies } from '@veupathdb/wdk-client/lib/Core/Store';
import { ActionThunk } from '@veupathdb/wdk-client/lib/Core/WdkMiddleware';
import { UserDataset, UserDatasetMeta } from '../Utils/types';
export type UserDatasetsCompatibleWdkService = WdkService &
  {
    [Key in keyof UserDatasetsServiceWrappers]: ReturnType<
      UserDatasetsServiceWrappers[Key]
    >;
  };
export type UserDatasetShareResponse = {
  [Key in 'add' | 'delete']: {
    [Key in string]: UserDataset['sharedWith'];
  };
};
type UserDatasetsServiceWrappers = typeof userDatasetsServiceWrappers;
export declare const userDatasetsServiceWrappers: {
  getCurrentUserDatasets: (
    wdkService: WdkService
  ) => () => Promise<UserDataset[]>;
  getUserDataset: (
    wdkService: WdkService
  ) => (id: number) => Promise<UserDataset>;
  updateUserDataset: (
    wdkService: WdkService
  ) => (id: number, meta: UserDatasetMeta) => Promise<void>;
  removeUserDataset: (wdkService: WdkService) => (id: number) => Promise<void>;
  editUserDatasetSharing: (
    wdkService: WdkService
  ) => (
    actionName: string,
    userDatasetIds: number[],
    recipientUserIds: number[]
  ) => Promise<UserDatasetShareResponse>;
  getUserDatasetDownloadUrl: (
    wdkService: WdkService
  ) => (datasetId: number, filename: string) => string;
  getUserIdsByEmail: (wdkService: WdkService) => (emails: string[]) => Promise<{
    results: Record<string, number>[];
  }>;
};
export declare function isUserDatasetsCompatibleWdkService(
  wdkService: WdkService
): wdkService is UserDatasetsCompatibleWdkService;
export declare function assertIsUserDatasetCompatibleWdkService(
  wdkService: WdkService
): asserts wdkService is UserDatasetsCompatibleWdkService;
export declare const MISCONFIGURED_USER_DATASET_SERVICE_ERROR_MESSAGE =
  'In order to use this feature, a UserDatasetsCompatibleWdkService must be configured.';
export interface UserDatasetCompatibleEpicDependencies
  extends EpicDependencies {
  wdkService: UserDatasetsCompatibleWdkService;
}
export declare function validateUserDatasetCompatibleThunk<T>(
  thunk: ActionThunk<T, UserDatasetCompatibleEpicDependencies>
): ActionThunk<T, UserDatasetCompatibleEpicDependencies>;
export {};
//# sourceMappingURL=UserDatasetWrappers.d.ts.map
