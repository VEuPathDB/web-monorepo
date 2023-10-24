import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { EpicDependencies } from '@veupathdb/wdk-client/lib/Core/Store';
import { ActionThunk } from '@veupathdb/wdk-client/lib/Core/WdkMiddleware';

import { UserDataset } from '../Utils/types';

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

export const userDatasetsServiceWrappers = {};

export function isUserDatasetsCompatibleWdkService(
  wdkService: WdkService
): wdkService is UserDatasetsCompatibleWdkService {
  return Object.keys(userDatasetsServiceWrappers).every(
    (userDatasetsServiceWrapperKey) =>
      userDatasetsServiceWrapperKey in wdkService
  );
}

export function assertIsUserDatasetCompatibleWdkService(
  wdkService: WdkService
): asserts wdkService is UserDatasetsCompatibleWdkService {
  if (!isUserDatasetsCompatibleWdkService(wdkService)) {
    throw new Error(MISCONFIGURED_USER_DATASET_SERVICE_ERROR_MESSAGE);
  }
}

export const MISCONFIGURED_USER_DATASET_SERVICE_ERROR_MESSAGE =
  'In order to use this feature, a UserDatasetsCompatibleWdkService must be configured.';

export interface UserDatasetCompatibleEpicDependencies
  extends EpicDependencies {
  wdkService: UserDatasetsCompatibleWdkService;
}

export function validateUserDatasetCompatibleThunk<T>(
  thunk: ActionThunk<T, UserDatasetCompatibleEpicDependencies>
): ActionThunk<T, UserDatasetCompatibleEpicDependencies> {
  return (wdkDependencies) => {
    assertIsUserDatasetCompatibleWdkService(wdkDependencies.wdkService);

    return thunk(wdkDependencies);
  };
}
