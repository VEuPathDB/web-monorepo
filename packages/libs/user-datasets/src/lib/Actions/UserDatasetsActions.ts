import { get } from "lodash";

import {
  transitionToInternalPage,
  Action as RouteAction,
} from "@veupathdb/wdk-client/lib/Actions/RouterActions";
import {
  updateUserPreference,
  PreferenceUpdateAction,
} from "@veupathdb/wdk-client/lib/Actions/UserActions";
import {
  EmptyAction,
  emptyAction,
} from "@veupathdb/wdk-client/lib/Core/WdkMiddleware";

import { validateVdiCompatibleThunk } from "../Service";

import { FILTER_BY_PROJECT_PREF } from "../Utils/project-filter";
import { ShareContext } from "../Utils/types";
import { FetchClientError } from "@veupathdb/http-utils";
import {
  InferAction,
  makeActionCreator,
} from "@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils";
import { DatasetDetails, DatasetFileListResponse, DatasetListEntry, DatasetPatchRequest } from "../Service/Types";
import { projectId } from "@veupathdb/web-common/lib/config";

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
  | ListUpdatingAction
  | ListUpdateErrorAction
  | ListUpdateSuccessAction
  | ProjectFilterAction
  | SharingDatasetPendingAction
  | SharingSuccessAction
  | SharingModalOpenAction
  | SharingErrorAction
  | CommunityAction;

// region List Actions

type ListAction =
  | ListLoadingAction
  | ListReceivedAction
  | ListErrorReceivedAction
  | ListUpdatingAction
  | ListUpdateSuccessAction
  | ListUpdateErrorAction;

// region List Loading

export const LIST_LOADING = "user-datasets/list-loading";

export type ListLoadingAction = {
  type: typeof LIST_LOADING;
};

export function listLoading(): ListLoadingAction {
  return {
    type: LIST_LOADING,
  };
}

export function loadUserDatasetListWithoutLoadingIndicator() {
  return validateVdiCompatibleThunk<ListAction>(({ wdkService }) =>
    Promise.all([
      wdkService.getCurrentUserPreferences().then(
        (preferences) =>
          get(preferences.global, FILTER_BY_PROJECT_PREF, "false") !== "false",
        // ignore error and default to false
        () => false,
      ),
      wdkService.vdiService.getDatasetList(projectId),
    ])
      .then(
        ([ filterByProject, userDatasets ]) => listReceived(userDatasets, filterByProject),
        listErrorReceived,
      ),
  );
}

export function loadUserDatasetList() {
  return [ listLoading(), loadUserDatasetListWithoutLoadingIndicator() ];
}

// endregion List Loading

// region List Received

export const LIST_RECEIVED = "user-dataset/list-received";

export type ListReceivedAction = {
  type: typeof LIST_RECEIVED;
  payload: {
    userDatasets: DatasetListEntry[];
    filterByProject: boolean;
  };
};

export function listReceived(
  userDatasets: DatasetListEntry[],
  filterByProject: boolean,
): ListReceivedAction {
  return {
    type: LIST_RECEIVED,
    payload: {
      userDatasets,
      filterByProject,
    },
  };
}

// endregion List Received

// region List Error Received

export const LIST_ERROR_RECEIVED = "user-dataset/list-error";

export type ListErrorReceivedAction = {
  type: typeof LIST_ERROR_RECEIVED;
  payload: {
    error: FetchClientError;
  };
};

export function listErrorReceived(
  error: FetchClientError,
): ListErrorReceivedAction {
  return {
    type: LIST_ERROR_RECEIVED,
    payload: {
      error,
    },
  };
}

// endregion List Error Received

// region List Item Updating

export const LIST_UPDATING = "user-datasets/list-updating";

export interface ListUpdatingAction {
  readonly type: typeof LIST_UPDATING;
  readonly payload: {
    readonly id: string
  };
}

export function listUpdating(id: string): ListUpdatingAction {
  return {
    type: LIST_UPDATING,
    payload: { id },
  };
}

// endregion List Item Updating

// region List Item Update Success

export const LIST_UPDATE_SUCCESS = "user-datasets/list-update-success";

export interface ListUpdateSuccessAction {
  readonly type: typeof LIST_UPDATE_SUCCESS;
  readonly payload: {
    readonly userDataset: DatasetListEntry;
  };
}

export function listUpdateSuccess(userDataset: DatasetListEntry): ListUpdateSuccessAction {
  return {
    type: LIST_UPDATE_SUCCESS,
    payload: { userDataset },
  };
}

// endregion List Item Update Success

// region List Item Update Error

export const LIST_UPDATE_ERROR = "user-datasets/list-update-error";

export interface ListUpdateErrorAction {
  readonly type: typeof LIST_UPDATE_ERROR;
  readonly payload: {
    readonly error: FetchClientError;
  };
}

export function listUpdateError(error: FetchClientError): ListUpdateErrorAction {
  return {
    type: LIST_UPDATE_ERROR,
    payload: { error },
  };
}

// endregion List Item Update Error

// endregion List Actions

// region Detail Actions

// region Detail Loading

type DetailAction =
  | DetailLoadingAction
  | DetailReceivedAction
  | DetailErrorAction;

export const DETAIL_LOADING = "user-datasets/detail-loading";

export type DetailLoadingAction = {
  type: typeof DETAIL_LOADING;
  payload: { id: string; };
};

export function detailLoading(id: string): DetailLoadingAction {
  return {
    type: DETAIL_LOADING,
    payload: { id },
  };
}

export function loadUserDatasetDetailWithoutLoadingIndicator(id: string) {
  return validateVdiCompatibleThunk<DetailAction>(({ wdkService }) =>
    wdkService.vdiService.getDataset(id)
      .then(
        userDataset => detailReceived(id, userDataset),
        (error: FetchClientError) => detailError(error),
      ),
  );
}

export function loadUserDatasetDetail(id: string) {
  return [ detailLoading(id), loadUserDatasetDetailWithoutLoadingIndicator(id) ];
}

// region Detail Received

export const DETAIL_RECEIVED = "user-datasets/detail-received";

export type DetailReceivedAction = {
  type: typeof DETAIL_RECEIVED;
  payload: {
    id: string;
    userDataset?: DatasetDetails;
    fileListing?: DatasetFileListResponse;
  };
};

export function detailReceived(
  id: string,
  userDataset?: DatasetDetails,
  fileListing?: DatasetFileListResponse,
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

// endregion Detail Loading

// region Detail Error

export const DETAIL_ERROR = "user-datasets/detail-error";

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

// endregion Detail Error

// endregion Detail Loading

// region Detail Updating

type UpdateAction =
  | DetailUpdatingAction
  | DetailUpdateSuccessAction
  | DetailUpdateErrorAction;

export const DETAIL_UPDATING = "user-dataests/detail-updating";

export type DetailUpdatingAction = {
  type: typeof DETAIL_UPDATING;
};

export function detailUpdating(): DetailUpdatingAction {
  return { type: DETAIL_UPDATING };
}

export function updateUserDatasetDetail(
  datasetId: string,
  patchRequest: DatasetPatchRequest,
) {
  return validateVdiCompatibleThunk<UpdateAction>(({ wdkService }) => [
    detailUpdating(),
    wdkService
      .vdiService
      .patchDataset(datasetId, patchRequest)
      .then(
        () => detailUpdateSuccess(datasetId),
        detailUpdateError,
      ),
  ]);
}

// region Detail Update Success

export const DETAIL_UPDATE_SUCCESS = "user-datasets/detail-update-success";

export type DetailUpdateSuccessAction = {
  type: typeof DETAIL_UPDATE_SUCCESS;
  payload: { id: string };
};

export function detailUpdateSuccess(id: string): DetailUpdateSuccessAction {
  return {
    type: DETAIL_UPDATE_SUCCESS,
    payload: { id },
  };
}

// endregion Detail Update Success

// region Detail Update Error

export const DETAIL_UPDATE_ERROR = "user-datasets/detail-update-error";

export type DetailUpdateErrorAction = {
  type: typeof DETAIL_UPDATE_ERROR;
  payload: {
    error: FetchClientError;
  };
};

export function detailUpdateError(
  error: FetchClientError,
): DetailUpdateErrorAction {
  return {
    type: DETAIL_UPDATE_ERROR,
    payload: {
      error,
    },
  };
}

// endregion Detail Update Error

// endregion Detail Updating

// region Detail Removing

type RemovalAction =
  | DetailRemovingAction
  | DetailRemoveSuccessAction
  | DetailRemoveErrorAction;

export const DETAIL_REMOVING = "user-datasets/detail-removing";

export interface DetailRemovingAction {
  readonly type: typeof DETAIL_REMOVING;
}

export function detailRemoving(): DetailRemovingAction {
  return { type: DETAIL_REMOVING, };
}

export function removeUserDataset(id: string, redirectTo?: string) {
  return validateVdiCompatibleThunk<RemovalAction | EmptyAction | RouteAction>(
    ({ wdkService }) => [
      detailRemoving(),
      wdkService
        .vdiService
        .deleteDataset(id)
        .then(
          () => [
            detailRemoveSuccess(id),
            typeof redirectTo === "string"
              ? transitionToInternalPage(redirectTo)
              : emptyAction,
          ],
          detailRemoveError,
        ),
    ],
  );
}

// region Detail Remove Success

export const DETAIL_REMOVE_SUCCESS = "user-datasets/detail-remove-success";

export interface DetailRemoveSuccessAction {
  readonly type: typeof DETAIL_REMOVE_SUCCESS;
  readonly payload: { id: string };
}

export function detailRemoveSuccess(id: string): DetailRemoveSuccessAction {
  return {
    type: DETAIL_REMOVE_SUCCESS,
    payload: { id },
  };
}

// endregion Detail Remove Success

// region Detail Remove Error

export const DETAIL_REMOVE_ERROR = "user-datasets/detail-remove-error";

export type DetailRemoveErrorAction = {
  type: typeof DETAIL_REMOVE_ERROR;
  payload: {
    error: FetchClientError;
  };
};

export function detailRemoveError(
  error: FetchClientError,
): DetailRemoveErrorAction {
  return {
    type: DETAIL_REMOVE_ERROR,
    payload: {
      error,
    },
  };
}

// endregion Detail Remove Error

// endregion Detail Removing

// endregion Detail Actions

// region Sharing Actions

export function shareUserDatasets(
  datasetIds: string[],
  recipientIds: number[],
  context: ShareContext,
) {
  // here we're making an array of objects to help facilitate the sharing of multiple datasets with multiple users
  const requests: { datasetId: string; recipientId: number }[] = [];
  for (const datasetId of datasetIds) {
    for (const recipientId of recipientIds) {
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
    Promise.all(requests.map(req =>
      wdkService.vdiService.putShareOffer(req.datasetId, req.recipientId, "grant"),
    ))
      .then(
        () =>
          context === "datasetDetails"
            ? [
              loadUserDatasetDetailWithoutLoadingIndicator(datasetIds[0]),
              sharingSuccess(true),
            ]
            : [
              loadUserDatasetListWithoutLoadingIndicator(),
              sharingSuccess(true),
            ],
        sharingError,
      ),
    updateSharingDatasetPending(false),
  ]);
}

export function unshareUserDataset(
  datasetId: string,
  recipientId: number,
  context: ShareContext,
) {
  return validateVdiCompatibleThunk<
    DetailAction | ListAction | SharingDatasetPendingAction | SharingErrorAction
  >(({ wdkService }) => [
    updateSharingDatasetPending(true),
    wdkService
      .vdiService
      .putShareOffer(datasetId, recipientId, "revoke")
      .then(() => {
        if (context === "datasetDetails") {
          return loadUserDatasetDetailWithoutLoadingIndicator(datasetId);
        } else {
          return loadUserDatasetListWithoutLoadingIndicator();
        }
      }, sharingError),
    updateSharingDatasetPending(false),
  ]);
}

// region Share Pending

export const SHARING_DATASET_PENDING = "user-datasets/sharing-dataset-pending";

export type SharingDatasetPendingAction = {
  type: typeof SHARING_DATASET_PENDING;
  payload: {
    sharingDatasetPending: boolean;
  };
};

export function updateSharingDatasetPending(
  sharingDatasetPending: boolean,
): SharingDatasetPendingAction {
  return {
    type: SHARING_DATASET_PENDING,
    payload: {
      sharingDatasetPending,
    },
  };
}

// endregion Share Pending

// region Share Success

export const SHARING_SUCCESS = "user-datasets/sharing-success";

export type SharingSuccessAction = {
  type: typeof SHARING_SUCCESS;
  payload: {
    shareSuccessful: boolean | undefined;
  };
};

export function sharingSuccess(
  shareSuccessful: boolean | undefined,
): SharingSuccessAction {
  return {
    type: SHARING_SUCCESS,
    payload: {
      shareSuccessful,
    },
  };
}

// endregion Share Success

// region Share Error

export const SHARING_ERROR = "user-datasets/sharing-error";

export type SharingErrorAction = {
  type: typeof SHARING_ERROR;
  payload: {
    shareError: Error | undefined;
  };
};

export function sharingError(
  shareError: Error | undefined,
): SharingErrorAction {
  return {
    type: SHARING_ERROR,
    payload: {
      shareError,
    },
  };
}

// endregion Share Success

// region Share Modal Open

export const SHARING_MODAL_OPEN = "user-datasets/sharing-modal-open-state";

export type SharingModalOpenAction = {
  type: typeof SHARING_MODAL_OPEN;
  payload: {
    sharingModalOpen: boolean;
  };
};

export function updateSharingModalState(
  sharingModalOpen: boolean,
): SharingModalOpenAction {
  return {
    type: SHARING_MODAL_OPEN,
    payload: {
      sharingModalOpen,
    },
  };
}

// endregion Share Success

// endregion Sharing Actions

export const PROJECT_FILTER =
  "user-datasets/project-filter-preference-received";

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

export function updateProjectFilter(filterByProject: boolean) {
  return validateVdiCompatibleThunk<
    PreferenceUpdateAction | ProjectFilterAction
  >(() => [
    updateUserPreference(
      "global",
      FILTER_BY_PROJECT_PREF,
      JSON.stringify(filterByProject),
    ),
    projectFilter(filterByProject),
  ]);
}

//==============================================================================

// Community sharing actions. Note, these are using the `makeActionCreator` utility
// which reduces boilerplate dramatically.

export const updateCommunityModalVisibility = makeActionCreator(
  "user-datasets/update-community-modal-visibility",
  (isVisible: boolean) => ({ isVisible }),
);

export const updateDatasetCommunityVisibilityPending = makeActionCreator(
  "user-datasets/update-community-visibility-pending",
);

export const updateDatasetCommunityVisibilitySuccess = makeActionCreator(
  "user-datasets/update-community-visibility-success",
);

export const updateDatasetCommunityVisibilityError = makeActionCreator(
  "user-datastes/update-community-visibility-error",
  (errorMessage: string) => ({ errorMessage }),
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
  context: "datasetDetails" | "datasetsList",
) {
  return [
    updateDatasetCommunityVisibilityPending(),
    validateVdiCompatibleThunk<UpdateCommunityVisibilityThunkAction>(
      async ({ wdkService }) => {
        try {
          await Promise.all(
            datasetIds.map((datasetId) =>
              wdkService.vdiService.patchDataset(datasetId, {
                visibility: { value: isVisibleToCommunity ? "public" : "private" },
              }),
            ),
          );
          if (context === "datasetDetails") {
            return [
              loadUserDatasetDetailWithoutLoadingIndicator(datasetIds[0]),
              updateDatasetCommunityVisibilitySuccess,
            ];
          } else {
            return [
              loadUserDatasetListWithoutLoadingIndicator(),
              updateDatasetCommunityVisibilitySuccess,
            ];
          }
        } catch (error) {
          return updateDatasetCommunityVisibilityError(String(error));
        }
      },
    ),
  ];
}

//==============================================================================
