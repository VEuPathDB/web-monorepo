import { get } from 'lodash';
import { transitionToInternalPage } from '@veupathdb/wdk-client/lib/Actions/RouterActions';
import { updateUserPreference } from '@veupathdb/wdk-client/lib/Actions/UserActions';
import { emptyAction } from '@veupathdb/wdk-client/lib/Core/WdkMiddleware';
import { validateUserDatasetCompatibleThunk } from '../Service/UserDatasetWrappers';
import { FILTER_BY_PROJECT_PREF } from '../Utils/project-filter';
//==============================================================================
export const LIST_LOADING = 'user-datasets/list-loading';
export function listLoading() {
  return {
    type: LIST_LOADING,
  };
}
//==============================================================================
export const LIST_RECEIVED = 'user-dataset/list-received';
export function listReceived(userDatasets, filterByProject) {
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
export function listErrorReceived(error) {
  return {
    type: LIST_ERROR_RECEIVED,
    payload: {
      error,
    },
  };
}
//==============================================================================
export const DETAIL_LOADING = 'user-datasets/detail-loading';
export function detailLoading(id) {
  return {
    type: DETAIL_LOADING,
    payload: {
      id,
    },
  };
}
//==============================================================================
export const DETAIL_RECEIVED = 'user-datasets/detail-received';
export function detailReceived(id, userDataset) {
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
export function detailError(error) {
  return {
    type: DETAIL_ERROR,
    payload: {
      error,
    },
  };
}
//==============================================================================
export const DETAIL_UPDATING = 'user-dataests/detail-updating';
export function detailUpdating() {
  return {
    type: DETAIL_UPDATING,
  };
}
//==============================================================================
export const DETAIL_UPDATE_SUCCESS = 'user-datasets/detail-update-success';
export function detailUpdateSuccess(userDataset) {
  return {
    type: DETAIL_UPDATE_SUCCESS,
    payload: {
      userDataset,
    },
  };
}
//==============================================================================
export const DETAIL_UPDATE_ERROR = 'user-datasets/detail-update-error';
export function detailUpdateError(error) {
  return {
    type: DETAIL_UPDATE_ERROR,
    payload: {
      error,
    },
  };
}
//==============================================================================
export const DETAIL_REMOVING = 'user-datasets/detail-removing';
export function detailRemoving() {
  return {
    type: DETAIL_REMOVING,
  };
}
//==============================================================================
export const DETAIL_REMOVE_SUCCESS = 'user-datasets/detail-remove-success';
export function detailRemoveSuccess(userDataset) {
  return {
    type: DETAIL_REMOVE_SUCCESS,
    payload: {
      userDataset,
    },
  };
}
//==============================================================================
export const DETAIL_REMOVE_ERROR = 'user-datasets/detail-remove-error';
export function detailRemoveError(error) {
  return {
    type: DETAIL_REMOVE_ERROR,
    payload: {
      error,
    },
  };
}
//==============================================================================
export const SHARING_DATASET = 'user-datasets/sharing-dataset';
export function sharingDataset(userDataset, recipients) {
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
export function sharingSuccess(response) {
  return {
    type: SHARING_SUCCESS,
    payload: {
      response,
    },
  };
}
//==============================================================================
export const SHARING_ERROR = 'user-datasets/sharing-error';
export function sharingError(error) {
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
export function projectFilter(filterByProject) {
  return {
    type: PROJECT_FILTER,
    payload: {
      filterByProject,
    },
  };
}
export function loadUserDatasetList() {
  return validateUserDatasetCompatibleThunk(({ wdkService }) => [
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
  ]);
}
export function loadUserDatasetDetail(id) {
  return validateUserDatasetCompatibleThunk(({ wdkService }) => [
    detailLoading(id),
    wdkService.getUserDataset(id).then(
      (userDataset) => detailReceived(id, userDataset),
      (error) =>
        error.status === 404 ? detailReceived(id) : detailError(error)
    ),
  ]);
}
export function shareUserDatasets(userDatasetIds, recipientUserIds) {
  return validateUserDatasetCompatibleThunk(({ wdkService }) => {
    return wdkService
      .editUserDatasetSharing('add', userDatasetIds, recipientUserIds)
      .then(sharingSuccess, sharingError);
  });
}
export function unshareUserDatasets(userDatasetIds, recipientUserIds) {
  return validateUserDatasetCompatibleThunk(({ wdkService }) => {
    return wdkService
      .editUserDatasetSharing('delete', userDatasetIds, recipientUserIds)
      .then(sharingSuccess, sharingError);
  });
}
export function updateUserDatasetDetail(userDataset, meta) {
  return validateUserDatasetCompatibleThunk(({ wdkService }) => [
    detailUpdating(),
    wdkService
      .updateUserDataset(userDataset.id, meta)
      .then(
        () =>
          detailUpdateSuccess(
            Object.assign(Object.assign({}, userDataset), { meta })
          ),
        detailUpdateError
      ),
  ]);
}
export function removeUserDataset(userDataset, redirectTo) {
  return validateUserDatasetCompatibleThunk(({ wdkService }) => [
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
  ]);
}
export function updateProjectFilter(filterByProject) {
  return validateUserDatasetCompatibleThunk(() => [
    updateUserPreference(
      'global',
      FILTER_BY_PROJECT_PREF,
      JSON.stringify(filterByProject)
    ),
    projectFilter(filterByProject),
  ]);
}
//# sourceMappingURL=UserDatasetsActions.js.map
