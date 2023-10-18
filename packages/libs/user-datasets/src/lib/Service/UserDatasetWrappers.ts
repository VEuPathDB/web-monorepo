import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import {
  arrayOf,
  number,
  objectOf,
  record,
} from '@veupathdb/wdk-client/lib/Utils/Json';
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

const userIdsByEmailDecoder = record({
  results: arrayOf(objectOf(number)),
});

export const userDatasetsServiceWrappers = {
  editUserDatasetSharing:
    (wdkService: WdkService) =>
    (
      actionName: string,
      userDatasetIds: number[],
      recipientUserIds: number[]
    ) => {
      const acceptableActions = ['add', 'delete'];
      if (!actionName || !acceptableActions.includes(actionName))
        throw new TypeError(
          `editUserDatasetSharing: invalid action name given: "${actionName}"`
        );
      const delta = JSON.stringify({
        [actionName]: userDatasetIds
          .map((id) => `${id}`)
          .reduce((output: object, datasetId: string) => {
            Object.defineProperty(output, datasetId, {
              value: recipientUserIds.map((id) => `${id}`),
              enumerable: true,
            });
            return output;
          }, {}),
      });
      return wdkService._fetchJson<UserDatasetShareResponse>(
        'patch',
        '/users/current/user-dataset-sharing',
        delta
      );
    },
  getUserIdsByEmail: (wdkService: WdkService) => (emails: string[]) => {
    return wdkService.sendRequest(userIdsByEmailDecoder, {
      path: '/user-id-query',
      method: 'POST',
      body: JSON.stringify({
        emails,
      }),
    });
  },
};

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
