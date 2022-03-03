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
  ActionThunk,
  EmptyAction,
  emptyAction,
} from '@veupathdb/wdk-client/lib/Core/WdkMiddleware';
import {
  UserDataset,
  UserDatasetMeta,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { ServiceError } from '@veupathdb/wdk-client/lib/Service/ServiceError';
import { UserDatasetShareResponse } from '@veupathdb/wdk-client/lib/Service/Mixins/UserDatasetsService';

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
    id: number;
  };
};

export function detailLoading(id: number): DetailLoadingAction {
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
    id: number;
    userDataset?: UserDataset;
  };
};

export function detailReceived(
  id: number,
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

const FILTER_BY_PROJECT_PREF = 'userDatasets.filterByProject';

export function loadUserDatasetList(): ActionThunk<ListAction> {
  return ({ wdkService }) => [
    listLoading(),
    Promise.all([
      wdkService.getCurrentUserPreferences().then(
        (preferences) =>
          get(preferences.global, FILTER_BY_PROJECT_PREF, 'false') !== 'false',
        // ignore error and default to false
        () => false
      ),
      wdkService.getCurrentUserDatasets(),
    ]).then(
      ([filterByProject, userDatasets]) =>
        listReceived(userDatasets, filterByProject),
      listErrorReceived
    ),
  ];
}

export function loadUserDatasetDetail(id: number): ActionThunk<DetailAction> {
  return ({ wdkService }) => [
    detailLoading(id),
    wdkService.getUserDataset(id).then(
      (userDataset) => detailReceived(id, userDataset),
      (error: ServiceError) =>
        error.status === 404 ? detailReceived(id) : detailError(error)
    ),
  ];
}

export function shareUserDatasets(
  userDatasetIds: number[],
  recipientUserIds: number[]
): ActionThunk<SharingAction> {
  return ({ wdkService }) => {
    return wdkService
      .editUserDatasetSharing('add', userDatasetIds, recipientUserIds)
      .then(sharingSuccess, sharingError);
  };
}

export function unshareUserDatasets(
  userDatasetIds: number[],
  recipientUserIds: number[]
): ActionThunk<SharingAction> {
  return ({ wdkService }) => {
    return wdkService
      .editUserDatasetSharing('delete', userDatasetIds, recipientUserIds)
      .then(sharingSuccess, sharingError);
  };
}

export function updateUserDatasetDetail(
  userDataset: UserDataset,
  meta: UserDatasetMeta
): ActionThunk<UpdateAction> {
  return ({ wdkService }) => [
    detailUpdating(),
    wdkService
      .updateUserDataset(userDataset.id, meta)
      .then(
        () => detailUpdateSuccess({ ...userDataset, meta }),
        detailUpdateError
      ),
  ];
}

export function removeUserDataset(
  userDataset: UserDataset,
  redirectTo?: string
): ActionThunk<RemovalAction | EmptyAction | RouteAction> {
  return ({ wdkService }) => [
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
  ];
}

export function updateProjectFilter(
  filterByProject: boolean
): ActionThunk<PreferenceUpdateAction | ProjectFilterAction> {
  return () => [
    updateUserPreference(
      'global',
      FILTER_BY_PROJECT_PREF,
      JSON.stringify(filterByProject)
    ),
    projectFilter(filterByProject),
  ];
}
