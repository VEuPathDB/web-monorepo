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

import { validateVdiCompatibleThunk } from '../Service';

import { FILTER_BY_PROJECT_PREF } from '../Utils/project-filter';
import {
  UserDataset,
  UserDatasetDetails,
  UserDatasetMeta,
  UserDatasetVDI,
  UserQuotaMetadata,
  UserDatasetShareResponse,
  UserDatasetFileListing,
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
    fileListing?: UserDatasetFileListing;
  };
};

export function detailReceived(
  id: string,
  userDataset?: UserDataset,
  fileListing?: UserDatasetFileListing
): DetailReceivedAction {
  return {
    type: DETAIL_RECEIVED,
    payload: {
      id,
      userDataset,
      fileListing,
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

export function loadUserDatasetList() {
  return validateVdiCompatibleThunk<ListAction>(({ wdkService }) => [
    listLoading(),
    Promise.all([
      wdkService.getCurrentUserPreferences().then(
        (preferences) =>
          get(preferences.global, FILTER_BY_PROJECT_PREF, 'false') !== 'false',
        // ignore error and default to false
        () => false
      ),
      wdkService.getCurrentUserDatasets(),
      wdkService.getUserQuotaMetadata(),
    ]).then(([filterByProject, userDatasets, userQuotaMetadata]) => {
      const vdiToExistingUds = userDatasets.map(
        (ud: UserDatasetVDI): UserDataset => {
          const { fileCount, shares, fileSizeTotal } = ud;
          const partiallyTransformedResponse =
            transformVdiResponseToLegacyResponseHelper(ud, userQuotaMetadata);
          return {
            ...partiallyTransformedResponse,
            datafiles: [],
            fileCount,
            size: fileSizeTotal,
            sharedWith: shares?.map((d) => ({
              user: d.userID,
              userDisplayName: d.firstName + ' ' + d.lastName,
            })),
          };
        }
      );
      return listReceived(vdiToExistingUds, filterByProject);
    }, listErrorReceived),
  ]);
}

export function loadUserDatasetDetail(id: string) {
  return validateVdiCompatibleThunk<DetailAction>(({ wdkService }) => [
    detailLoading(id),
    Promise.all([
      wdkService.getUserDataset(id),
      wdkService.getUserQuotaMetadata(),
      wdkService.getUserDatasetFileListing(id),
    ]).then(
      ([userDataset, userQuotaMetadata, fileListing]) => {
        const { files, shares } = userDataset as UserDatasetDetails;
        const partiallyTransformedResponse =
          transformVdiResponseToLegacyResponseHelper(
            userDataset,
            userQuotaMetadata
          );
        const transformedResponse = {
          ...partiallyTransformedResponse,
          datafiles: files,
          fileCount: files.length,
          size: files.reduce((prev, curr) => prev + curr.size, 0),
          sharedWith: shares
            ?.filter((d) => d.status === 'grant')
            .map((d) => ({
              userDisplayName:
                d.recipient.firstName + ' ' + d.recipient.lastName,
              user: d.recipient.userID,
            })),
        };
        return detailReceived(id, transformedResponse, fileListing);
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
  return validateVdiCompatibleThunk<SharingAction>(({ wdkService }) => {
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
          add: sharingSuccessObject,
          delete: { undefined },
        }),
      sharingError
    );
  });
}

export function unshareUserDatasets(
  userDatasetId: string,
  recipientUserId: number
) {
  return validateVdiCompatibleThunk<SharingAction>(({ wdkService }) => {
    return wdkService
      .editUserDatasetSharing('revoke', userDatasetId, recipientUserId)
      .then(
        () =>
          sharingSuccess({
            add: { undefined },
            delete: {
              userDatasetId: [
                {
                  userDisplayName: 'My Name',
                  user: recipientUserId,
                },
              ],
            },
          }),
        sharingError
      );
  });
}

export function updateUserDatasetDetail(
  userDataset: UserDataset,
  meta: UserDatasetMeta
) {
  return validateVdiCompatibleThunk<UpdateAction>(({ wdkService }) => [
    detailUpdating(),
    wdkService
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
  return validateVdiCompatibleThunk<RemovalAction | EmptyAction | RouteAction>(
    ({ wdkService }) => [
      detailRemoving(),
      wdkService
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
    ]
  );
}

export function updateProjectFilter(filterByProject: boolean) {
  return validateVdiCompatibleThunk<
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

type PartialLegacyUserDataset = Omit<
  UserDataset,
  'datafiles' | 'fileCount' | 'size' | 'sharedWith'
>;

function transformVdiResponseToLegacyResponseHelper(
  ud: UserDatasetDetails | UserDatasetVDI,
  userQuotaMetadata: UserQuotaMetadata
): PartialLegacyUserDataset {
  const {
    name,
    description,
    summary,
    owner,
    datasetType,
    projectIDs,
    datasetID,
    created,
    status,
  } = ud;
  const { quota } = userQuotaMetadata;
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
      description: description ?? '',
      summary: summary ?? '',
    },
    ownerUserId: owner.userID,
    dependencies: [],
    age: Date.now() - Date.parse(created),
    id: datasetID,
    questions: [],
    percentQuotaUsed: quota.usage / quota.limit,
    status,
  };
}
