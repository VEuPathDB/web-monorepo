import { FetchClientError } from '@veupathdb/http-utils';
import {
  Action,
  DETAIL_LOADING,
  DETAIL_RECEIVED,
  DETAIL_ERROR,
  DETAIL_UPDATING,
  DETAIL_UPDATE_SUCCESS,
  DETAIL_UPDATE_ERROR,
  DETAIL_REMOVING,
  DETAIL_REMOVE_SUCCESS,
  DETAIL_REMOVE_ERROR,
  SHARING_SUCCESS,
  SHARING_MODAL_OPEN,
  SHARING_DATASET_PENDING,
  SHARING_ERROR,
  updateCommunityModalVisibility,
  updateDatasetCommunityVisibilityError,
  updateDatasetCommunityVisibilityPending,
  updateDatasetCommunityVisibilitySuccess,
} from '../Actions/UserDatasetsActions';

import { DatasetDetails } from "../Service/Types";

export const key = 'userDatasetDetail';

/**
 * If isLoading is false, and resource is undefined,
 * then assume the user dataset does not exist
 */
export type UserDatasetEntry = {
  isLoading: boolean;
  resource?: DatasetDetails;
};

export interface State {
  userDatasetsById: Record<string, UserDatasetEntry>;
  userDatasetUpdating: boolean;
  userDatasetLoading: boolean;
  userDatasetRemoving: boolean;
  sharingModalOpen: boolean;
  sharingDatasetPending: boolean;
  loadError?: FetchClientError;
  updateError?: FetchClientError;
  removalError?: FetchClientError;
  shareError: Error | undefined;
  shareSuccessful: boolean | undefined;
  communityModalOpen: boolean;
  updateDatasetCommunityVisibilityPending: boolean;
  updateDatasetCommunityVisibilitySuccess: boolean;
  updateDatasetCommunityVisibilityError: string | undefined;
}

const initialState: State = {
  userDatasetsById: {},
  userDatasetLoading: false,
  userDatasetUpdating: false,
  userDatasetRemoving: false,
  sharingModalOpen: false,
  sharingDatasetPending: false,
  shareError: undefined,
  shareSuccessful: undefined,
  communityModalOpen: false,
  updateDatasetCommunityVisibilityError: undefined,
  updateDatasetCommunityVisibilityPending: false,
  updateDatasetCommunityVisibilitySuccess: false,
};

/**
 * Stores a map of userDatasets by id. By not storing the current userDataset,
 * we avoid race conditions where the DATASET_DETAIL_RECEIVED actions are
 * dispatched in a different order than the corresponding action creators are
 * invoked.
 */
export function reduce(state: State = initialState, action: Action): State {
  switch (action.type) {
    case DETAIL_LOADING:
      return {
        ...state,
        userDatasetsById: {
          ...state.userDatasetsById,
          [action.payload.id]: {
            isLoading: true,
          },
        },
      };

    case DETAIL_RECEIVED:
      return {
        ...state,
        userDatasetLoading: false,
        userDatasetsById: {
          ...state.userDatasetsById,
          [action.payload.id]: {
            isLoading: false,
            resource: action.payload.userDataset,
          },
        },
      };

    case DETAIL_ERROR:
      return {
        ...state,
        userDatasetLoading: false,
        loadError: action.payload.error,
      };

    case DETAIL_UPDATING:
      return {
        ...state,
        userDatasetUpdating: true,
        updateError: undefined,
      };

    case DETAIL_UPDATE_SUCCESS:
      return {
        ...state,
        userDatasetUpdating: false,
        userDatasetsById: {
          ...state.userDatasetsById,
          [action.payload.userDataset.datasetId]: {
            isLoading: false,
            resource: action.payload.userDataset,
          },
        },
      };

    case DETAIL_UPDATE_ERROR:
      return {
        ...state,
        userDatasetUpdating: false,
        updateError: action.payload.error,
      };

    case DETAIL_REMOVING:
      return {
        ...state,
        userDatasetRemoving: true,
      };

    case DETAIL_REMOVE_SUCCESS:
      return {
        ...state,
        userDatasetRemoving: false,
        removalError: undefined,
      };

    case DETAIL_REMOVE_ERROR:
      return {
        ...state,
        userDatasetRemoving: false,
        removalError: action.payload.error,
      };

    case SHARING_SUCCESS:
      return {
        ...state,
        sharingDatasetPending: false,
        shareSuccessful: action.payload.shareSuccessful,
      };

    case SHARING_MODAL_OPEN:
      return {
        ...state,
        sharingModalOpen: action.payload.sharingModalOpen,
      };

    case SHARING_DATASET_PENDING:
      return {
        ...state,
        sharingDatasetPending: action.payload.sharingDatasetPending,
      };

    case SHARING_ERROR:
      return {
        ...state,
        sharingDatasetPending: false,
        shareError: action.payload.shareError,
      };

    case updateCommunityModalVisibility.type:
      return {
        ...state,
        communityModalOpen: action.payload.isVisible,
        // clear related states when closed
        ...(action.payload.isVisible
          ? {}
          : {
              updateDatasetCommunityVisibilityError: undefined,
              updateDatasetCommunityVisibilityPending: false,
              updateDatasetCommunityVisibilitySuccess: false,
            }),
      };

    case updateDatasetCommunityVisibilityError.type:
      return {
        ...state,
        updateDatasetCommunityVisibilityPending: false,
        updateDatasetCommunityVisibilityError: action.payload.errorMessage,
      };

    case updateDatasetCommunityVisibilityPending.type:
      return {
        ...state,
        updateDatasetCommunityVisibilityPending: true,
      };

    case updateDatasetCommunityVisibilitySuccess.type:
      return {
        ...state,
        updateDatasetCommunityVisibilityPending: false,
        updateDatasetCommunityVisibilitySuccess: true,
      };

    default:
      return state;
  }
}
