import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import {
  arrayOf,
  number,
  objectOf,
  record,
} from '@veupathdb/wdk-client/lib/Utils/Json';
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

const userIdsByEmailDecoder = record({
  results: arrayOf(objectOf(number)),
});

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
  getUserDatasetDownloadUrl: (wdkService: WdkService) => (
    datasetId: number,
    filename: string
  ) => {
    if (typeof datasetId !== 'number')
      throw new TypeError(
        `Can't build downloadUrl; invalid datasetId given (${datasetId}) [${typeof datasetId}]`
      );
    if (typeof filename !== 'string')
      throw new TypeError(
        `Can't build downloadUrl; invalid filename given (${filename}) [${typeof filename}]`
      );

    return `${wdkService.serviceUrl}/users/current/user-datasets/${datasetId}/user-datafiles/${filename}`;
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

export interface UserDatasetCompatibleEpicDependencies
  extends EpicDependencies {
  wdkService: UserDatasetsCompatibleWdkService;
}

export function validateUserDatasetCompatibleThunk<T>(
  thunk: ActionThunk<T, UserDatasetCompatibleEpicDependencies>
): ActionThunk<T, UserDatasetCompatibleEpicDependencies> {
  return (wdkDependencies) => {
    if (!isUserDatasetsCompatibleWdkService(wdkDependencies.wdkService)) {
      throw new Error(
        'Tried to execute a thunk with a misconfigured UserDatasetsCompatibleWdkService.'
      );
    }

    return thunk(wdkDependencies);
  };
}
