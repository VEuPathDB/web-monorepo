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

export const userDatasetsServiceWrappers = {
  getCurrentUserDatasets: (wdkService: WdkService) => () =>
    wdkService._fetchJson<UserDataset[]>(
      'get',
      '/users/current/user-datasets?expandDetails=true'
    ),
  getUserDataset: (wdkService: WdkService) => (id: number) =>
    wdkService._fetchJson<UserDataset>(
      'get',
      `/users/current/user-datasets/${id}`
    ),
  updateUserDataset: (wdkService: WdkService) => (
    id: number,
    meta: UserDatasetMeta
  ) =>
    wdkService._fetchJson<void>(
      'put',
      `/users/current/user-datasets/${id}/meta`,
      JSON.stringify(meta)
    ),
  removeUserDataset: (wdkService: WdkService) => (id: number) =>
    wdkService._fetchJson<void>('delete', `/users/current/user-datasets/${id}`),
  editUserDatasetSharing: (wdkService: WdkService) => (
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
};

export function isUserDatasetsCompatibleWdkService(
  wdkService: WdkService
): wdkService is UserDatasetsCompatibleWdkService {
  return Object.keys(userDatasetsServiceWrappers).every(
    (userDatasetsServiceWrapperKey) =>
      userDatasetsServiceWrapperKey in wdkService
  );
}

export function validateUserDatasetCompatibleThunk<
  T,
  S extends EpicDependencies = EpicDependencies
>(
  thunk: ActionThunk<
    T,
    Omit<S, 'wdkService'> & { wdkService: UserDatasetsCompatibleWdkService }
  >
): ActionThunk<T, S> {
  return (wdkDependencies) => {
    if (!isUserDatasetsCompatibleWdkService(wdkDependencies.wdkService)) {
      throw new Error(
        'Tried to execute a thunk with a misconfigured UserDatasetsCompatibleWdkService.'
      );
    }

    return thunk(wdkDependencies);
  };
}
