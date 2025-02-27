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

import { validateVdiCompatibleThunk } from '../Service';

import { FILTER_BY_PROJECT_PREF } from '../Utils/project-filter';
import {
  UserDataset,
  UserDatasetDetails,
  UserDatasetMeta_UI,
  UserDatasetVDI,
  UserDatasetFileListing,
  UserDatasetContact,
  UserDatasetHyperlink,
  UserDatasetPublication,
} from '../Utils/types';
import { FetchClientError } from '@veupathdb/http-utils';
import {
  InferAction,
  makeActionCreator,
} from '@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils';

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
  | SharingDatasetPendingAction
  | SharingSuccessAction
  | SharingModalOpenAction
  | SharingErrorAction
  | CommunityAction;

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
  'user-datastes/update-community-visibility-error',
  (errorMessage: string) => ({ errorMessage })
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
  context: 'datasetDetails' | 'datasetsList'
) {
  return [
    updateDatasetCommunityVisibilityPending(),
    validateVdiCompatibleThunk<UpdateCommunityVisibilityThunkAction>(
      async ({ wdkService }) => {
        try {
          await Promise.all(
            datasetIds.map((datasetId) =>
              wdkService.updateUserDataset(datasetId, {
                visibility: isVisibleToCommunity ? 'public' : 'private',
              })
            )
          );
          if (context === 'datasetDetails') {
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
      }
    ),
  ];
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

export function loadUserDatasetListWithoutLoadingIndicator() {
  return validateVdiCompatibleThunk<ListAction>(({ wdkService }) =>
    Promise.all([
      wdkService.getCurrentUserPreferences().then(
        (preferences) =>
          get(preferences.global, FILTER_BY_PROJECT_PREF, 'false') !== 'false',
        // ignore error and default to false
        () => false
      ),
      wdkService.getCurrentUserDatasets(),
    ]).then(([filterByProject, userDatasets]) => {
      const vdiToExistingUds = userDatasets.map(
        (ud: UserDatasetVDI): UserDataset => {
          const { fileCount, shares, fileSizeTotal } = ud;
          const partiallyTransformedResponse =
            transformVdiResponseToLegacyResponseHelper(ud);
          return {
            ...partiallyTransformedResponse,
            fileCount,
            size: fileSizeTotal,
            sharedWith: shares?.map((d) => ({
              user: d.userId,
              userDisplayName: d.firstName + ' ' + d.lastName,
            })),
          };
        }
      );
      return listReceived(vdiToExistingUds, filterByProject);
    }, listErrorReceived)
  );
}

export function loadUserDatasetList() {
  return [listLoading(), loadUserDatasetListWithoutLoadingIndicator()];
}

export function loadUserDatasetDetailWithoutLoadingIndicator(id: string) {
  return validateVdiCompatibleThunk<DetailAction>(({ wdkService }) =>
    Promise.all([
      wdkService.getUserDataset(id),
      wdkService.getUserDatasetFileListing(id),
    ]).then(
      ([userDataset, fileListing]) => {
        const { shares, dependencies } = userDataset as UserDatasetDetails;
        const partiallyTransformedResponse =
          transformVdiResponseToLegacyResponseHelper(userDataset);
        const transformedResponse = {
          ...partiallyTransformedResponse,
          fileListing,
          fileCount: fileListing?.upload?.contents.length,
          size: fileListing?.upload?.zipSize,
          sharedWith: shares
            ?.filter((d) => d.status === 'grant')
            .map((d) => ({
              userDisplayName:
                d.recipient.firstName + ' ' + d.recipient.lastName,
              user: d.recipient.userId,
            })),
          dependencies,
        };
        return detailReceived(id, transformedResponse, fileListing);
      },
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
  context: 'datasetDetails' | 'datasetsList'
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
        wdkService.editUserDatasetSharing(
          'grant',
          req.datasetId,
          req.recipientId
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

export function unshareUserDatasets(
  userDatasetId: string,
  recipientUserId: number,
  context: 'datasetDetails' | 'datasetsList'
) {
  return validateVdiCompatibleThunk<
    DetailAction | ListAction | SharingDatasetPendingAction | SharingErrorAction
  >(({ wdkService }) => [
    updateSharingDatasetPending(true),
    wdkService
      .editUserDatasetSharing('revoke', userDatasetId, recipientUserId)
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

export function updateUserDatasetDetail(
  userDataset: UserDataset,
  meta: UserDatasetMeta_UI
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
  ud: UserDatasetDetails | UserDatasetVDI
): PartialLegacyUserDataset {
  const {
    name,
    description,
    summary,
    owner,
    datasetType,
    projectIds,
    datasetId,
    created,
    status,
    importMessages,
    visibility,
    shortName,
    shortAttribution,
    category,
    publications,
    hyperlinks,
    organisms,
    contacts,
    createdOn,
  } = ud;
  return {
    owner: owner.firstName + ' ' + owner.lastName,
    projects: projectIds ?? [],
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
      visibility,
      shortName: shortName ?? '',
      shortAttribution: shortAttribution ?? '',
      category: category ?? '',
      publications: publications ?? ([] as UserDatasetPublication[]),
      hyperlinks: hyperlinks ?? ([] as UserDatasetHyperlink[]),
      organisms: organisms ?? [],
      contacts: contacts ?? ([] as UserDatasetContact[]),
      createdOn: createdOn ?? '',
    },
    ownerUserId: owner.userId,
    age: Date.now() - Date.parse(created),
    id: datasetId,
    status,
    importMessages: importMessages ?? [],
  };
}
