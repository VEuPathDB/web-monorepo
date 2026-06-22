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

import { validateVdiCompatibleThunk, VdiServiceMetadata } from '../Service';

import { FILTER_BY_PROJECT_PREF } from '../Utils/project-filter';
import { DatasetGetResponseBody, DatasetListEntry } from '../Service';
import { FetchClientError } from '@veupathdb/http-utils';
import {
  InferAction,
  makeActionCreator,
} from '@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils';

import { DatasetPatchRequest } from '../Service/Model';
import { SharingModalContext } from '../Components/Sharing/UserDatasetSharingModal';
import {
  CommunityPromotionError,
  CommunityPromotionValidationError,
} from '../Components/Sharing/CommunityPromotionError';
import { ValidationErrorBody } from '../Service/Model/response-decoders';
import { Consumer } from '../Utils';

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
  | ListItemUpdatingAction
  | ListItemUpdateErrorAction
  | ListItemUpdateSuccessAction
  | ProjectFilterAction
  | SharingDatasetPendingAction
  | SharingSuccessAction
  | SharingModalOpenAction
  | SharingErrorAction
  | CommunityAction
  | ServiceMetaLoading
  | ServiceMetaReceived;

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
    userDatasets: DatasetListEntry[];
    filterByProject: boolean;
  };
};

export function listReceived(
  userDatasets: DatasetListEntry[],
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
    error: FetchClientError;
  };
};

export function listErrorReceived(
  error: FetchClientError
): ListErrorReceivedAction {
  return {
    type: LIST_ERROR_RECEIVED,
    payload: {
      error,
    },
  };
}

//==============================================================================

export const LIST_ITEM_UPDATING = 'user-datasets/list-item-updating';

export type ListItemUpdatingAction = {
  type: typeof LIST_ITEM_UPDATING;
};

export function listItemUpdating(): ListItemUpdatingAction {
  return {
    type: LIST_ITEM_UPDATING,
  };
}

//==============================================================================

export const LIST_ITEM_UPDATE_SUCCESS =
  'user-datasets/list-item-update-success';

export type ListItemUpdateSuccessAction = {
  type: typeof LIST_ITEM_UPDATE_SUCCESS;
  payload: {
    userDataset: DatasetListEntry;
  };
};

export function listItemUpdateSuccess(
  userDataset: DatasetListEntry
): ListItemUpdateSuccessAction {
  return {
    type: LIST_ITEM_UPDATE_SUCCESS,
    payload: { userDataset },
  };
}

//==============================================================================

export const LIST_ITEM_UPDATE_ERROR = 'user-datasets/list-item-update-error';

export type ListItemUpdateErrorAction = {
  type: typeof LIST_ITEM_UPDATE_ERROR;
  payload: {
    error: FetchClientError;
  };
};

export function listItemUpdateError(
  error: FetchClientError
): ListItemUpdateErrorAction {
  return {
    type: LIST_ITEM_UPDATE_ERROR,
    payload: { error },
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
    userDataset?: DatasetGetResponseBody;
  };
};

export function detailReceived(
  id: string,
  userDataset?: DatasetGetResponseBody
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
    error: FetchClientError;
  };
};

export function detailError(error: FetchClientError): DetailErrorAction {
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
    userDataset: DatasetGetResponseBody;
  };
};

export function detailUpdateSuccess(
  userDataset: DatasetGetResponseBody
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
    error: FetchClientError;
  };
};

export function detailUpdateError(
  error: FetchClientError
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
    datasetId: string;
  };
};

export function detailRemoveSuccess(
  datasetId: string
): DetailRemoveSuccessAction {
  return {
    type: DETAIL_REMOVE_SUCCESS,
    payload: {
      datasetId,
    },
  };
}

//==============================================================================

export const DETAIL_REMOVE_ERROR = 'user-datasets/detail-remove-error';

export type DetailRemoveErrorAction = {
  type: typeof DETAIL_REMOVE_ERROR;
  payload: {
    error: FetchClientError;
  };
};

export function detailRemoveError(
  error: FetchClientError
): DetailRemoveErrorAction {
  return {
    type: DETAIL_REMOVE_ERROR,
    payload: {
      error,
    },
  };
}

//==============================================================================

export const SHARING_DATASET_PENDING = 'user-datasets/sharing-dataset-pending';

export type SharingDatasetPendingAction = {
  type: typeof SHARING_DATASET_PENDING;
  payload: {
    sharingDatasetPending: boolean;
  };
};

export function updateSharingDatasetPending(
  sharingDatasetPending: boolean
): SharingDatasetPendingAction {
  return {
    type: SHARING_DATASET_PENDING,
    payload: {
      sharingDatasetPending,
    },
  };
}

//==============================================================================

export const SHARING_SUCCESS = 'user-datasets/sharing-success';

export type SharingSuccessAction = {
  type: typeof SHARING_SUCCESS;
  payload: {
    shareSuccessful: boolean | undefined;
  };
};

export function sharingSuccess(
  shareSuccessful: boolean | undefined
): SharingSuccessAction {
  return {
    type: SHARING_SUCCESS,
    payload: {
      shareSuccessful,
    },
  };
}

//==============================================================================

export const SHARING_ERROR = 'user-datasets/sharing-error';

export type SharingErrorAction = {
  type: typeof SHARING_ERROR;
  payload: {
    shareError: Error | undefined;
  };
};

export function sharingError(
  shareError: Error | undefined
): SharingErrorAction {
  return {
    type: SHARING_ERROR,
    payload: {
      shareError,
    },
  };
}

//==============================================================================

export const SHARING_MODAL_OPEN = 'user-datasets/sharing-modal-open-state';

export type SharingModalOpenAction = {
  type: typeof SHARING_MODAL_OPEN;
  payload: {
    sharingModalOpen: boolean;
  };
};

export function updateSharingModalState(
  sharingModalOpen: boolean
): SharingModalOpenAction {
  return {
    type: SHARING_MODAL_OPEN,
    payload: {
      sharingModalOpen,
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

export const METADATA_LOADING = 'user-datasets/service-meta-loading';

export interface ServiceMetaLoading {
  type: typeof METADATA_LOADING;
}

export function serviceMetaLoading(): ServiceMetaLoading {
  return {
    type: METADATA_LOADING,
  };
}

//==============================================================================

export const METADATA_RECEIVED = 'user-datasets/service-meta-received';

export interface ServiceMetaReceived {
  type: typeof METADATA_RECEIVED;
  payload: VdiServiceMetadata;
}

export function serviceMetaReceived(
  meta: VdiServiceMetadata
): ServiceMetaReceived {
  return {
    type: METADATA_RECEIVED,
    payload: meta,
  };
}

//==============================================================================

// Community sharing actions. Note, these are using the `makeActionCreator` utility
// which reduces boilerplate dramatically.

export const updateCommunityModalVisibility = makeActionCreator(
  'user-datasets/update-community-modal-visibility',
  (isVisible: boolean) => ({ isVisible })
);

export const updateDatasetCommunityVisibilityPending = makeActionCreator(
  'user-datasets/update-community-visibility-pending'
);

export const updateDatasetCommunityVisibilitySuccess = makeActionCreator(
  'user-datasets/update-community-visibility-success'
);

export const updateDatasetCommunityVisibilityError = makeActionCreator(
  'user-datasets/update-community-visibility-error',
  (errorMessage: CommunityPromotionError) => ({ errorMessage })
);

type UpdateCommunityVisibilityThunkAction =
  | InferAction<typeof updateDatasetCommunityVisibilitySuccess>
  | InferAction<typeof updateDatasetCommunityVisibilityError>
  | DetailAction
  | ListAction;

type CommunityAction =
  | InferAction<typeof updateCommunityModalVisibility>
  | InferAction<typeof updateDatasetCommunityVisibilityPending>
  | InferAction<typeof updateDatasetCommunityVisibilitySuccess>
  | InferAction<typeof updateDatasetCommunityVisibilityError>;

export function updateDatasetCommunityVisibility(
  datasetIds: string[],
  isVisibleToCommunity: boolean,
  context: 'datasetDetails' | 'datasetsList',
  onError?: Consumer<ValidationErrorBody>,
) {
  return [
    updateDatasetCommunityVisibilityPending(),
    validateVdiCompatibleThunk<UpdateCommunityVisibilityThunkAction>(
      async ({ wdkService }) => {
        try {
          const validationErrors: CommunityPromotionValidationError[] =
            [];
          const serviceErrors: string[] = [];

          await Promise.all(
            datasetIds.map((datasetId) =>
              wdkService.vdi.patchDatasetDetails(
                datasetId,
                {
                  visibility: {
                    value: isVisibleToCommunity ? 'public' : 'private',
                  },
                },
                // on success
                undefined,
                // on validation error
                (response) => {
                  if (onError)
                    onError(response);
                  else
                    validationErrors.push({
                      datasetId,
                      general: response.errors.general,
                      byField: response.errors.byKey,
                    });
                },
                // on misc error
                ({ message }) => {
                  if (message) serviceErrors.push(message);
                }
              )
            )
          );

          if (validationErrors.length === 0 && serviceErrors.length === 0) {
            return context === 'datasetDetails'
              ? [
                  loadUserDatasetDetailWithoutLoadingIndicator(datasetIds[0]),
                  updateDatasetCommunityVisibilitySuccess,
                ]
              : [
                  loadUserDatasetListWithoutLoadingIndicator(),
                  updateDatasetCommunityVisibilitySuccess,
                ];
          }

          return updateDatasetCommunityVisibilityError({
            serviceErrors,
            validationErrors,
          });
        } catch (error) {
          return updateDatasetCommunityVisibilityError({
            clientError: String(error),
          });
        }
      }
    ),
  ];
}

//==============================================================================

type ListAction =
  | ListLoadingAction
  | ListReceivedAction
  | ListErrorReceivedAction;
type ListItemUpdateAction =
  | ListItemUpdatingAction
  | ListItemUpdateErrorAction
  | ListItemUpdateSuccessAction;
type DetailAction =
  | DetailLoadingAction
  | DetailReceivedAction
  | DetailErrorAction;
type DetailUpdateAction =
  | DetailUpdatingAction
  | DetailUpdateSuccessAction
  | DetailUpdateErrorAction;
type RemovalAction =
  | DetailRemovingAction
  | DetailRemoveSuccessAction
  | DetailRemoveErrorAction;
type ServiceMetaAction = ServiceMetaLoading | ServiceMetaReceived;

export function loadUserDatasetListWithoutLoadingIndicator() {
  return validateVdiCompatibleThunk<ListAction>(({ wdkService }) =>
    Promise.all([
      wdkService.getCurrentUserPreferences().then(
        (preferences) =>
          get(preferences.global, FILTER_BY_PROJECT_PREF, 'false') !== 'false',
        // ignore error and default to false
        () => false
      ),
      wdkService.vdi.getDatasetList(),
    ]).then(
      ([filterByProject, userDatasets]) =>
        listReceived(userDatasets, filterByProject),
      listErrorReceived
    )
  );
}

export function loadUserDatasetList() {
  return [listLoading(), loadUserDatasetListWithoutLoadingIndicator()];
}

export function loadVdiServiceMetadataWithoutLoadingIndicator() {
  return validateVdiCompatibleThunk<ServiceMetaAction>(({ wdkService }) =>
    wdkService.vdi.getServiceMetadata().then(serviceMetaReceived)
  );
}

export function loadVdiServiceMetadata() {
  return [
    serviceMetaLoading(),
    loadVdiServiceMetadataWithoutLoadingIndicator(),
  ];
}

export function loadUserDatasetDetailWithoutLoadingIndicator(id: string) {
  return validateVdiCompatibleThunk<DetailAction>(({ wdkService }) =>
    wdkService.vdi.getDatasetDetails(id).then(
      (ud: DatasetGetResponseBody) => detailReceived(id, ud),
      (error: FetchClientError) => detailError(error)
    )
  );
}

export function loadUserDatasetDetail(id: string) {
  return [detailLoading(id), loadUserDatasetDetailWithoutLoadingIndicator(id)];
}

export function shareUserDatasets(
  userDatasetIds: string[],
  recipientUserIds: number[],
  context: SharingModalContext
) {
  // here we're making an array of objects to help facilitate the sharing of multiple datasets with multiple users
  const requests: { datasetId: string; recipientId: number }[] = [];
  for (const datasetId of userDatasetIds) {
    for (const recipientId of recipientUserIds) {
      requests.push({ datasetId, recipientId });
    }
  }
  return validateVdiCompatibleThunk<
    | DetailAction
    | ListAction
    | SharingDatasetPendingAction
    | SharingSuccessAction
    | SharingErrorAction
  >(({ wdkService }) => [
    updateSharingDatasetPending(true),
    Promise.all(
      requests.map((req) =>
        wdkService.vdi.putDatasetShareOffer(
          req.datasetId,
          req.recipientId,
          'grant'
        )
      )
    ).then(() => {
      if (context === 'datasetDetails') {
        return [
          loadUserDatasetDetailWithoutLoadingIndicator(userDatasetIds[0]),
          sharingSuccess(true),
        ];
      } else {
        return [
          loadUserDatasetListWithoutLoadingIndicator(),
          sharingSuccess(true),
        ];
      }
    }, sharingError),
    updateSharingDatasetPending(false),
  ]);
}

export function unshareUserDataset(
  userDatasetId: string,
  recipientUserId: number,
  context: SharingModalContext
) {
  return validateVdiCompatibleThunk<
    DetailAction | ListAction | SharingDatasetPendingAction | SharingErrorAction
  >(({ wdkService }) => [
    updateSharingDatasetPending(true),
    wdkService.vdi
      .putDatasetShareOffer(userDatasetId, recipientUserId, 'revoke')
      .then(() => {
        if (context === 'datasetDetails') {
          return loadUserDatasetDetailWithoutLoadingIndicator(userDatasetId);
        } else {
          return loadUserDatasetListWithoutLoadingIndicator();
        }
      }, sharingError),
    updateSharingDatasetPending(false),
  ]);
}

export function updateDatasetListItem(
  original: DatasetListEntry,
  updates: Partial<DatasetListEntry>,
  patch: DatasetPatchRequest
) {
  return validateVdiCompatibleThunk<ListItemUpdateAction>(({ wdkService }) => [
    listItemUpdating(),
    wdkService.vdi
      .patchDatasetDetails(original.datasetId, patch)
      .then(
        () => listItemUpdateSuccess({ ...original, ...updates }),
        listItemUpdateError
      ),
  ]);
}

export function updateUserDatasetDetail(
  original: DatasetGetResponseBody,
  updates: Partial<DatasetGetResponseBody>,
  patch: DatasetPatchRequest
) {
  return validateVdiCompatibleThunk<DetailUpdateAction>(({ wdkService }) => [
    detailUpdating(),
    wdkService.vdi
      .patchDatasetDetails(original.datasetId, patch)
      .then(
        () => detailUpdateSuccess({ ...original, ...updates }),
        detailUpdateError
      ),
  ]);
}

export function removeUserDataset(datasetId: string, redirectTo?: string) {
  return validateVdiCompatibleThunk<RemovalAction | EmptyAction | RouteAction>(
    ({ wdkService }) => [
      detailRemoving(),
      wdkService.vdi
        .deleteDataset(datasetId)
        .then(
          () => [
            detailRemoveSuccess(datasetId),
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
