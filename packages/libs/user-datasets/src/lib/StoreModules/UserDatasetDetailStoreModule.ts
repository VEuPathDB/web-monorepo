import sharingReducer from '@veupathdb/wdk-client/lib/Views/UserDatasets/Sharing/UserDatasetSharingReducer';
import { UserDataset } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { ServiceError } from '@veupathdb/wdk-client/lib/Service/ServiceError';
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
} from '../Actions/UserDatasetsActions';

export const key = 'userDatasetDetail';

/**
 * If isLoading is false, and resource is undefined,
 * then assume the user dataset does not exist
 */
export type UserDatasetEntry = {
  isLoading: boolean;
  resource?: UserDataset;
};

export interface State {
  userDatasetsById: { [key: string]: UserDatasetEntry };
  userDatasetUpdating: boolean;
  userDatasetLoading: boolean;
  userDatasetRemoving: boolean;
  loadError?: ServiceError;
  updateError?: ServiceError;
  removalError? : ServiceError;
}

const initialState: State = {
  userDatasetsById: {},
  userDatasetLoading: false,
  userDatasetUpdating: false,
  userDatasetRemoving: false
};

/**
 * Stores a map of userDatasets by id. By not storing the current userDataset,
 * we avoid race conditions where the DATASET_DETAIL_RECEIVED actions are
 * dispatched in a different order than the corresponding action creators are
 * invoked.
 */
export function reduce(state: State = initialState, action: Action): State {
  switch (action.type) {
    case DETAIL_LOADING: return {
      ...state,
      userDatasetsById: {
        ...state.userDatasetsById,
        [action.payload.id]: {
          isLoading: true
        }
      }
    };

    case DETAIL_RECEIVED: return {
      ...state,
      userDatasetLoading: false,
      userDatasetsById: {
        ...state.userDatasetsById,
        [action.payload.id]: {
          isLoading: false,
          resource: action.payload.userDataset
        }
      }
    };

    case DETAIL_ERROR: return {
      ...state,
      userDatasetLoading: false,
      loadError: action.payload.error
    };

    case DETAIL_UPDATING: return {
      ...state,
      userDatasetUpdating: true,
      updateError: undefined
    };

    case DETAIL_UPDATE_SUCCESS: return {
      ...state,
      userDatasetUpdating: false,
      userDatasetsById: {
        ...state.userDatasetsById,
        [action.payload.userDataset.id]: {
          isLoading: false,
          resource: action.payload.userDataset
        }
      }
    };

    case DETAIL_UPDATE_ERROR: return {
      ...state,
      userDatasetUpdating: false,
      updateError: action.payload.error
    };

    case DETAIL_REMOVING: return {
      ...state,
      userDatasetRemoving: true
    };

    case DETAIL_REMOVE_SUCCESS: return {
      ...state,
      userDatasetRemoving: false,
      removalError: undefined
    };

    case DETAIL_REMOVE_ERROR: return {
      ...state,
      userDatasetRemoving: false,
      removalError: action.payload.error
    };

    case SHARING_SUCCESS: return {
      ...state,
      userDatasetsById: sharingReducer(state.userDatasetsById, action)
    };

    default:
      return state;
  }
}
