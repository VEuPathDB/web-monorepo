import { get } from 'lodash';

import {
  transitionToInternalPage,
  Action as RouteAction,
} from '@veupathdb/wdk-client/lib/Actions/RouterActions';
import {
  updateUserPreference,
  PreferenceUpdateAction,
} from '@veupathdb/wdk-client/lib/Actions/UserActions';
import {
  EmptyAction,
  emptyAction,
} from '@veupathdb/wdk-client/lib/Core/WdkMiddleware';
import { ServiceError } from '@veupathdb/wdk-client/lib/Service/ServiceError';

import {
  UserDatasetShareResponse,
  validateUserDatasetCompatibleThunk,
} from '../Service/UserDatasetWrappers';

import { FILTER_BY_PROJECT_PREF } from '../Utils/project-filter';
import {
  UserDataset,
  UserDatasetDetails,
  UserDatasetMeta,
  UserDatasetVDI,
} from '../Utils/types';

export type Action =
  | DetailErrorAction
  | DetailLoadingAction
  | DetailReceivedAction
  | DetailRemoveErrorAction
  | DetailRemoveSuccessAction
  | DetailRemovingAction
  | DetailUpdateErrorAction
  | DetailUpdateSuccessAction
  | DetailUpdatingAction
  | ListLoadingAction
  | ListErrorReceivedAction
  | ListReceivedAction
  | ProjectFilterAction
  | SharingDatasetAction
  | SharingSuccessAction;

//==============================================================================

export const LIST_LOADING = 'user-datasets/list-loading';

export type ListLoadingAction = {
  type: typeof LIST_LOADING;
};

export function listLoading(): ListLoadingAction {
  return {
    type: LIST_LOADING,
  };
}

//==============================================================================

export const LIST_RECEIVED = 'user-dataset/list-received';

export type ListReceivedAction = {
  type: typeof LIST_RECEIVED;
  payload: {
    userDatasets: UserDataset[];
    filterByProject: boolean;
  };
};

export function listReceived(
  userDatasets: UserDataset[],
  filterByProject: boolean
): ListReceivedAction {
  return {
    type: LIST_RECEIVED,
    payload: {
      userDatasets,
      filterByProject,
    },
  };
}

//==============================================================================

export const LIST_ERROR_RECEIVED = 'user-dataset/list-error';

export type ListErrorReceivedAction = {
  type: typeof LIST_ERROR_RECEIVED;
  payload: {
    error: ServiceError;
  };
};

export function listErrorReceived(
  error: ServiceError
): ListErrorReceivedAction {
  return {
    type: LIST_ERROR_RECEIVED,
    payload: {
      error,
    },
  };
}

//==============================================================================

export const DETAIL_LOADING = 'user-datasets/detail-loading';

export type DetailLoadingAction = {
  type: typeof DETAIL_LOADING;
  payload: {
    id: string;
  };
};

export function detailLoading(id: string): DetailLoadingAction {
  return {
    type: DETAIL_LOADING,
    payload: {
      id,
    },
  };
}

//==============================================================================

export const DETAIL_RECEIVED = 'user-datasets/detail-received';

export type DetailReceivedAction = {
  type: typeof DETAIL_RECEIVED;
  payload: {
    id: string;
    userDataset?: UserDataset;
  };
};

export function detailReceived(
  id: string,
  userDataset?: UserDataset
): DetailReceivedAction {
  return {
    type: DETAIL_RECEIVED,
    payload: {
      id,
      userDataset,
    },
  };
}

//==============================================================================

export const DETAIL_ERROR = 'user-datasets/detail-error';

export type DetailErrorAction = {
  type: typeof DETAIL_ERROR;
  payload: {
    error: ServiceError;
  };
};

export function detailError(error: ServiceError): DetailErrorAction {
  return {
    type: DETAIL_ERROR,
    payload: {
      error,
    },
  };
}

//==============================================================================

export const DETAIL_UPDATING = 'user-dataests/detail-updating';

export type DetailUpdatingAction = {
  type: typeof DETAIL_UPDATING;
};

export function detailUpdating(): DetailUpdatingAction {
  return {
    type: DETAIL_UPDATING,
  };
}

//==============================================================================

export const DETAIL_UPDATE_SUCCESS = 'user-datasets/detail-update-success';

export type DetailUpdateSuccessAction = {
  type: typeof DETAIL_UPDATE_SUCCESS;
  payload: {
    userDataset: UserDataset;
  };
};

export function detailUpdateSuccess(
  userDataset: UserDataset
): DetailUpdateSuccessAction {
  return {
    type: DETAIL_UPDATE_SUCCESS,
    payload: {
      userDataset,
    },
  };
}

//==============================================================================

export const DETAIL_UPDATE_ERROR = 'user-datasets/detail-update-error';

export type DetailUpdateErrorAction = {
  type: typeof DETAIL_UPDATE_ERROR;
  payload: {
    error: ServiceError;
  };
};

export function detailUpdateError(
  error: ServiceError
): DetailUpdateErrorAction {
  return {
    type: DETAIL_UPDATE_ERROR,
    payload: {
      error,
    },
  };
}

//==============================================================================

export const DETAIL_REMOVING = 'user-datasets/detail-removing';

export type DetailRemovingAction = {
  type: typeof DETAIL_REMOVING;
};

export function detailRemoving(): DetailRemovingAction {
  return {
    type: DETAIL_REMOVING,
  };
}

//==============================================================================

export const DETAIL_REMOVE_SUCCESS = 'user-datasets/detail-remove-success';

export type DetailRemoveSuccessAction = {
  type: typeof DETAIL_REMOVE_SUCCESS;
  payload: {
    userDataset: UserDataset;
  };
};

export function detailRemoveSuccess(
  userDataset: UserDataset
): DetailRemoveSuccessAction {
  return {
    type: DETAIL_REMOVE_SUCCESS,
    payload: {
      userDataset,
    },
  };
}

//==============================================================================

export const DETAIL_REMOVE_ERROR = 'user-datasets/detail-remove-error';

export type DetailRemoveErrorAction = {
  type: typeof DETAIL_REMOVE_ERROR;
  payload: {
    error: ServiceError;
  };
};

export function detailRemoveError(
  error: ServiceError
): DetailRemoveErrorAction {
  return {
    type: DETAIL_REMOVE_ERROR,
    payload: {
      error,
    },
  };
}

//==============================================================================

export const SHARING_DATASET = 'user-datasets/sharing-dataset';

export type SharingDatasetAction = {
  type: typeof SHARING_DATASET;
  payload: {
    userDataset: UserDataset;
    recipients: string[];
  };
};

export function sharingDataset(
  userDataset: UserDataset,
  recipients: string[]
): SharingDatasetAction {
  return {
    type: SHARING_DATASET,
    payload: {
      userDataset,
      recipients,
    },
  };
}

//==============================================================================

export const SHARING_SUCCESS = 'user-datasets/sharing-success';

export type SharingSuccessAction = {
  type: typeof SHARING_SUCCESS;
  payload: {
    response: UserDatasetShareResponse;
  };
};

export function sharingSuccess(
  response: UserDatasetShareResponse
): SharingSuccessAction {
  return {
    type: SHARING_SUCCESS,
    payload: {
      response,
    },
  };
}

//==============================================================================

export const SHARING_ERROR = 'user-datasets/sharing-error';

export type SharingErrorAction = {
  type: typeof SHARING_ERROR;
  payload: {
    error: Error;
  };
};

export function sharingError(error: Error): SharingErrorAction {
  return {
    type: SHARING_ERROR,
    payload: {
      error,
    },
  };
}

//==============================================================================

export const PROJECT_FILTER =
  'user-datasets/project-filter-preference-received';

export type ProjectFilterAction = {
  type: typeof PROJECT_FILTER;
  payload: {
    filterByProject: boolean;
  };
};

export function projectFilter(filterByProject: boolean): ProjectFilterAction {
  return {
    type: PROJECT_FILTER,
    payload: {
      filterByProject,
    },
  };
}

//==============================================================================

type ListAction =
  | ListLoadingAction
  | ListReceivedAction
  | ListErrorReceivedAction;
type DetailAction =
  | DetailLoadingAction
  | DetailReceivedAction
  | DetailErrorAction;
type UpdateAction =
  | DetailUpdatingAction
  | DetailUpdateSuccessAction
  | DetailUpdateErrorAction;
type RemovalAction =
  | DetailRemovingAction
  | DetailRemoveSuccessAction
  | DetailRemoveErrorAction;
type SharingAction =
  | SharingDatasetAction
  | SharingSuccessAction
  | SharingErrorAction;

// replace w/ VDI service
export function loadUserDatasetList() {
  return validateUserDatasetCompatibleThunk<ListAction>(({ wdkService }) => [
    listLoading(),
    Promise.all([
      wdkService.getCurrentUserPreferences().then(
        (preferences) =>
          get(preferences.global, FILTER_BY_PROJECT_PREF, 'false') !== 'false',
        // ignore error and default to false
        () => false
      ),
      // @ts-ignore
      wdkService.getCurrentUserDatasets(),
    ]).then(([filterByProject, userDatasets]) => {
      const vdiToExistingUds = userDatasets.map(
        (ud: UserDatasetVDI): UserDataset => {
          const {
            name,
            description,
            summary,
            owner,
            datasetType,
            projectIDs,
            datasetID,
            fileCount,
            shares,
          } = ud;
          return {
            owner: owner.firstName + ' ' + owner.lastName,
            projects: projectIDs,
            created: ud.created,
            type: {
              display: datasetType.displayName ?? datasetType.name,
              name: datasetType.name,
              version: datasetType.version,
            },
            meta: {
              name,
              description: description ?? name,
              summary: summary ?? '',
            },
            ownerUserId: owner.userID,
            dependencies: [],
            age: 0,
            size: ud.fileSizeTotal,
            id: datasetID,
            isCompatible: false,
            isInstalled: false,
            sharedWith: shares?.map((d) => ({
              user: d.userID,
              userDisplayName: d.firstName + ' ' + d.lastName,
            })),
            questions: [],
            uploaded: 1,
            modified: 1,
            percentQuotaUsed: 0,
            datafiles: [],
            fileCount,
          };
        }
      );
      // return listReceived(userDatasets, filterByProject)
      return listReceived(vdiToExistingUds, filterByProject);
    }, listErrorReceived),
  ]);
}

export function loadUserDatasetDetail(id: string) {
  return validateUserDatasetCompatibleThunk<DetailAction>(({ wdkService }) => [
    detailLoading(id),
    // @ts-ignore
    wdkService.getUserDataset(id).then(
      (userDataset: UserDatasetDetails) => {
        const transformedResponse =
          transformVdiResponseToLegacyResponse(userDataset);
        return detailReceived(id, transformedResponse);
      },
      (error: ServiceError) =>
        error.status === 404 ? detailReceived(id) : detailError(error)
    ),
  ]);
}

export function shareUserDatasets(
  userDatasetIds: string[],
  recipientUserIds: number[]
) {
  return validateUserDatasetCompatibleThunk<SharingAction>(({ wdkService }) => {
    const requests = [];
    for (const datasetId of userDatasetIds) {
      for (const recipientId of recipientUserIds) {
        requests.push({ datasetId, recipientId });
      }
    }

    const sharingSuccessObject = requests.reduce((prev, curr, index) => {
      const { datasetId, recipientId } = curr;
      if (datasetId in prev) {
        return {
          ...prev,
          // @ts-ignore
          [datasetId]: prev[datasetId].concat({
            userDisplayName: `Name-${index}`,
            user: recipientId,
          }),
        };
      } else {
        return {
          ...prev,
          [datasetId]: [
            { userDisplayName: `Name-${index}`, user: recipientId },
          ],
        };
      }
    }, {});

    return Promise.all(
      requests.map((req) =>
        // @ts-ignore
        wdkService.editUserDatasetSharing(
          'grant',
          req.datasetId,
          req.recipientId
        )
      )
    ).then(
      // can editUserDatasetSharing return a 200 response w/ the recipient's userDisplayName and id?
      () =>
        sharingSuccess({
          //@ts-ignore
          add: sharingSuccessObject,
          delete: { undefined },
        }),
      sharingError
    );
  });
}

export function unshareUserDatasets(
  userDatasetIds: string[],
  recipientUserIds: number[]
) {
  return validateUserDatasetCompatibleThunk<SharingAction>(({ wdkService }) => {
    return (
      wdkService
        // @ts-ignore
        .editUserDatasetSharing('revoke', userDatasetIds, recipientUserIds)
        .then(
          () =>
            sharingSuccess({
              add: { undefined },
              delete: {
                [userDatasetIds[0]]: [
                  {
                    userDisplayName: 'My Name',
                    user: recipientUserIds[0],
                  },
                ],
              },
            }),
          sharingError
        )
    );
  });
}

export function updateUserDatasetDetail(
  userDataset: UserDataset,
  meta: UserDatasetMeta
) {
  return validateUserDatasetCompatibleThunk<UpdateAction>(({ wdkService }) => [
    detailUpdating(),
    wdkService
      // @ts-ignore
      .updateUserDataset(userDataset.id, meta)
      .then(
        () => detailUpdateSuccess({ ...userDataset, meta }),
        detailUpdateError
      ),
  ]);
}

export function removeUserDataset(
  userDataset: UserDataset,
  redirectTo?: string
) {
  return validateUserDatasetCompatibleThunk<
    RemovalAction | EmptyAction | RouteAction
  >(({ wdkService }) => [
    detailRemoving(),
    wdkService
      // @ts-ignore
      .removeUserDataset(userDataset.id)
      .then(
        () => [
          detailRemoveSuccess(userDataset),
          typeof redirectTo === 'string'
            ? transitionToInternalPage(redirectTo)
            : emptyAction,
        ],
        detailRemoveError
      ),
  ]);
}

export function updateProjectFilter(filterByProject: boolean) {
  return validateUserDatasetCompatibleThunk<
    PreferenceUpdateAction | ProjectFilterAction
  >(() => [
    updateUserPreference(
      'global',
      FILTER_BY_PROJECT_PREF,
      JSON.stringify(filterByProject)
    ),
    projectFilter(filterByProject),
  ]);
}

function transformVdiResponseToLegacyResponse(
  ud: UserDatasetDetails
): UserDataset {
  const {
    name,
    description,
    summary,
    owner,
    datasetType,
    projectIDs,
    datasetID,
    files,
    shares,
  } = ud;
  return {
    owner: owner.firstName + ' ' + owner.lastName,
    projects: projectIDs ?? [],
    created: ud.created,
    type: {
      display: datasetType.displayName ?? datasetType.name,
      name: datasetType.name,
      version: datasetType.version,
    },
    meta: {
      name,
      description: description ?? name,
      summary: summary ?? '',
    },
    ownerUserId: owner.userID,
    dependencies: [],
    age: 0,
    size: files.reduce((prev, curr) => prev + curr.size, 0),
    id: datasetID,
    isCompatible: false,
    isInstalled: false,
    sharedWith: shares
      ?.filter((d) => d.status === 'grant')
      .map((d) => ({
        userDisplayName: d.recipient.firstName + ' ' + d.recipient.lastName,
        // TODO: need a way to pass in the unique userId in details
        user: 378138370,
      })),
    questions: [],
    uploaded: 1,
    modified: 1,
    percentQuotaUsed: 0,
    datafiles: files,
    fileCount: files.length,
  };
}
