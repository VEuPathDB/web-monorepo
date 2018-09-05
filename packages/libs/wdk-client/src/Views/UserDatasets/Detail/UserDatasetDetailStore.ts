import WdkStore, { BaseState } from '../../../Core/State/Stores/WdkStore';
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
} from '../UserDatasetsActionCreators';
import sharingReducer from '../Sharing/UserDatasetSharingReducer';
import { UserDataset } from '../../../Utils/WdkModel';
import { ServiceError } from '../../../Utils/WdkService';

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

export interface State extends BaseState {
  userDatasetsById: { [key: string]: UserDatasetEntry };
  userDatasetUpdating: boolean;
  userDatasetLoading: boolean;
  userDatasetRemoving: boolean;
  loadError?: ServiceError;
  updateError?: ServiceError;
  removalError? : ServiceError;
}

/**
 * Stores a map of userDatasets by id. By not storing the current userDataset,
 * we avoid race conditions where the DATASET_DETAIL_RECEIVED actions are
 * dispatched in a different order than the corresponding action creators are
 * invoked.
 */
export default class UserDatasetDetailStore extends WdkStore<State> {

  storeShouldReceiveAction(channel?: string) {
    return (
      super.storeShouldReceiveAction(channel) ||
      channel === 'UserDatasetListStore'
    );
  }

  getInitialState (): State {
    return Object.assign({
      userDatasetsById: {},
      userDatasetUpdating: false,
      userDatasetRemoving: false
    }, super.getInitialState());
  }

  handleAction (state: State, action: Action): State {
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
}
