import {
  Action,
  DETAIL_REMOVE_SUCCESS,
  LIST_ERROR_RECEIVED,
  LIST_ITEM_UPDATE_SUCCESS,
  LIST_LOADING,
  LIST_RECEIVED,
  PROJECT_FILTER,
  SHARING_DATASET_PENDING,
  SHARING_ERROR,
  SHARING_MODAL_OPEN,
  SHARING_SUCCESS,
} from '../../Actions/UserDatasetsActions';
import { FetchAction, FetchState, FetchStatus, setFetchState } from './actions/fetch-datasets';

export const key = 'userDatasetList';

type SharingModalState = {
  readonly sharingModalOpen: boolean;
  readonly sharingDatasetPending: boolean;
  readonly shareError: Error | undefined;
  readonly shareSuccessful: boolean | undefined;
};

export type State = SharingModalState & FetchState;

const initialState: State = {
  fetchStatus: FetchStatus.NotStarted,
  sharingModalOpen: false,
  sharingDatasetPending: false,
  shareError: undefined,
  shareSuccessful: undefined,
};

export function reduce(state: State = initialState, { type, payload }: Action | FetchAction): State {
  switch (type) {
    case setFetchState.type:
      return payload.fetchStatus === FetchStatus.Success
        ? { ...state, fetchStatus: payload.fetchStatus, datasets: payload.datasets }
        : { ...state, fetchStatus: payload.fetchStatus, datasets: undefined };

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
        userDatasets: action.payload.userDatasets,
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

    case LIST_ITEM_UPDATE_SUCCESS:
      return state.status === 'complete'
        ? {
            ...state,
            // replace the old dataset list object with the updated one.
            userDatasets: state.userDatasets.map((it) =>
              it.datasetId === action.payload.userDataset.datasetId
                ? action.payload.userDataset
                : it
            ),
          }
        : state;

    case DETAIL_REMOVE_SUCCESS:
      return state.status === 'complete'
        ? {
            ...state,
            userDatasets: state.userDatasets.filter(
              (it) => it.datasetId !== action.payload.datasetId
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

    default:
      return state;
  }
}
