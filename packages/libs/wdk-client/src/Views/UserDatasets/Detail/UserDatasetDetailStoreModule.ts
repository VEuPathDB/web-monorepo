import {
  DetailLoading,
  DetailUpdatingAction,
  DetailErrorAction,
  DetailReceivedAction,
  DetailUpdateErrorAction,
  DetailUpdateSuccessAction,
  DetailRemovingAction,
  DetailRemoveSuccessAction,
  DetailRemoveErrorAction,
  SharingSuccessAction
} from 'wdk-client/Views/UserDatasets/UserDatasetsActionCreators';
import sharingReducer from 'wdk-client/Views/UserDatasets/Sharing/UserDatasetSharingReducer';
import { UserDataset } from 'wdk-client/Utils/WdkModel';
import { ServiceError } from 'wdk-client/Utils/WdkService';

export const key = 'userDatasetDetail';

type Action = DetailLoading
            | DetailUpdatingAction
            | DetailErrorAction
            | DetailReceivedAction
            | DetailUpdateErrorAction
            | DetailUpdateSuccessAction
            | DetailRemovingAction
            | DetailRemoveSuccessAction
            | DetailRemoveErrorAction
            | SharingSuccessAction;

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
    case 'user-datasets/detail-loading': return {
      ...state,
      userDatasetsById: {
        ...state.userDatasetsById,
        [action.payload.id]: {
          isLoading: true
        }
      }
    };

    case 'user-datasets/detail-received': return {
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

    case 'user-datasets/detail-error': return {
      ...state,
      userDatasetLoading: false,
      loadError: action.payload.error
    };

    case 'user-datasets/detail-updating': return {
      ...state,
      userDatasetUpdating: true,
      updateError: undefined
    };

    case 'user-datasets/detail-update-success': return {
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

    case 'user-datasets/detail-update-error': return {
      ...state,
      userDatasetUpdating: false,
      updateError: action.payload.error
    };

    case 'user-datasets/detail-removing': return {
      ...state,
      userDatasetRemoving: true
    };

    case 'user-datasets/detail-remove-success': return {
      ...state,
      userDatasetRemoving: false,
      removalError: undefined
    };

    case 'user-datasets/detail-remove-error': return {
      ...state,
      userDatasetRemoving: false,
      removalError: action.payload.error
    };

    case 'user-datasets/sharing-success': {
      return {
        ...state,
        userDatasetsById: sharingReducer(state.userDatasetsById, action)
      }
    };

    default:
      return state;
  }
}
