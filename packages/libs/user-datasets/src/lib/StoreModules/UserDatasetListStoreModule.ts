import { difference, omit } from 'lodash';

import {
  Action,
  LIST_LOADING,
  LIST_RECEIVED,
  LIST_ERROR_RECEIVED,
  DETAIL_UPDATE_SUCCESS,
  DETAIL_REMOVE_SUCCESS,
  SHARING_SUCCESS,
  PROJECT_FILTER,
  SHARING_MODAL_OPEN,
  SHARING_DATASET_PENDING,
  SHARING_ERROR,
  updateCommunityModalVisibility,
  updateDatasetCommunityVisibilityError,
  updateDatasetCommunityVisibilityPending,
  updateDatasetCommunityVisibilitySuccess,
} from '../Actions/UserDatasetsActions';

import { UserDataset } from '../Utils/types';

export const key = 'userDatasetList';

type SharingModalState = {
  sharingModalOpen: boolean;
  sharingDatasetPending: boolean;
  shareError: Error | undefined;
  shareSuccessful: boolean | undefined;
  communityModalOpen: boolean;
  updateDatasetCommunityVisibilityPending: boolean;
  updateDatasetCommunityVisibilitySuccess: boolean;
  updateDatasetCommunityVisibilityError: string | undefined;
};

type InitialState = SharingModalState & {
  status: 'not-requested';
};

type LoadingState = SharingModalState & {
  status: 'loading';
};

type ErrorState = SharingModalState & {
  status: 'error';
  loadError: Error;
};

type ForbiddenState = SharingModalState & {
  status: 'forbidden';
  loadError: Error;
};

type CompleteState = SharingModalState & {
  status: 'complete';
  userDatasets: Array<string | number>;
  userDatasetsById: Record<string, { isLoading: false; resource: UserDataset }>;
  filterByProject: boolean;
};

export type State =
  | InitialState
  | LoadingState
  | ErrorState
  | ForbiddenState
  | CompleteState;

const initialState: State = {
  status: 'not-requested',
  sharingModalOpen: false,
  sharingDatasetPending: false,
  shareError: undefined,
  shareSuccessful: undefined,
  communityModalOpen: false,
  updateDatasetCommunityVisibilityPending: false,
  updateDatasetCommunityVisibilitySuccess: false,
  updateDatasetCommunityVisibilityError: undefined,
};

export function reduce(state: State = initialState, action: Action): State {
  switch (action.type) {
    case LIST_LOADING:
      return {
        ...state,
        status: 'loading',
      };

    case LIST_RECEIVED:
      return {
        ...state,
        status: 'complete',
        filterByProject: action.payload.filterByProject,
        userDatasets: action.payload.userDatasets.map((ud) => ud.id),
        userDatasetsById: action.payload.userDatasets.reduce(
          (uds, ud) =>
            Object.assign(uds, { [ud.id]: { loading: false, resource: ud } }),
          {} as CompleteState['userDatasetsById']
        ),
      };

    case LIST_ERROR_RECEIVED:
      return action.payload.error.statusCode === 403
        ? {
            ...state,
            status: 'forbidden',
            loadError: action.payload.error,
          }
        : {
            ...state,
            status: 'error',
            loadError: action.payload.error,
          };

    case DETAIL_UPDATE_SUCCESS:
      return state.status === 'complete'
        ? {
            ...state,
            userDatasetsById: {
              ...state.userDatasetsById,
              [action.payload.userDataset.id]: {
                isLoading: false,
                resource: action.payload.userDataset,
              },
            },
          }
        : state;

    case DETAIL_REMOVE_SUCCESS:
      return state.status === 'complete'
        ? {
            ...state,
            userDatasets: difference(state.userDatasets, [
              action.payload.userDataset.id,
            ]),
            userDatasetsById: omit(
              state.userDatasetsById,
              action.payload.userDataset.id
            ),
          }
        : state;

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

    case PROJECT_FILTER: {
      if (state.status === 'complete') {
        return {
          ...state,
          filterByProject: action.payload.filterByProject,
        } as CompleteState;
      }
      return state;
    }

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
