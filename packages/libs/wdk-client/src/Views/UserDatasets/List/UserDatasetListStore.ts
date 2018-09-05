import WdkStore, { BaseState } from '../../../Core/State/Stores/WdkStore';
import { UserDataset } from '../../../Utils/WdkModel';
import sharingReducer from '../Sharing/UserDatasetSharingReducer';
import {
  DetailRemoveSuccessAction,
  DetailUpdateErrorAction,
  DetailUpdateSuccessAction,
  ListErrorReceivedAction,
  ListLoadingAction,
  ListReceivedAction,
  ProjectFilterAction,
  SharingSuccessAction,
} from '../UserDatasetsActionCreators';
import { difference } from 'lodash';

type Action = ListLoadingAction
  | ListReceivedAction
  | ListErrorReceivedAction
  | DetailUpdateErrorAction
  | DetailUpdateSuccessAction
  | DetailRemoveSuccessAction
  | SharingSuccessAction
  | ProjectFilterAction;

type InitialState = BaseState & {
  status: 'not-requested';
}

type LoadingState = BaseState & {
  status: 'loading';
}

type ErrorState = BaseState & {
  status: 'error';
  loadError: Error;
}

type ForbiddenState = BaseState & {
  status: 'forbidden';
  loadError: Error;
}

type CompleteState = BaseState & {
  status: 'complete';
  userDatasets: number[];
  userDatasetsById: Record<string, { isLoading: false; resource: UserDataset }>;
  filterByProject: boolean;
}

export type State =  InitialState | LoadingState | ErrorState | ForbiddenState | CompleteState;

export default class UserDatasetListStore extends WdkStore<State> {

  storeShouldReceiveAction(channel?: string) {
    return (
      super.storeShouldReceiveAction(channel) ||
      channel === 'UserDatasetDetailStore'
    );
  }

  getInitialState(): InitialState {
    return {
      globalData: super.getInitialState().globalData,
      status: 'not-requested'
    };
  }

  handleAction (state: State, action: Action): State {
    switch (action.type) {
      case 'user-datasets/list-loading': return <LoadingState> {
        globalData: state.globalData,
        status: 'loading'
      };

      case 'user-datasets/list-received': return <CompleteState> {
        globalData: state.globalData,
        status: 'complete',
        filterByProject: action.payload.filterByProject,
        userDatasets: action.payload.userDatasets.map(ud => ud.id),
        userDatasetsById: action.payload.userDatasets.reduce((uds, ud) =>
          Object.assign(uds, { [ud.id]: { loading: false, resource: ud }}), {} as CompleteState['userDatasetsById'])
      };

      case 'user-datasets/list-error': return <ErrorState|ForbiddenState>{
        globalData: state.globalData,
        status: action.payload.error.status === 403 ? 'forbidden' : 'error',
        loadError: action.payload.error
      };

      case 'user-datasets/detail-update-success': return state.status === 'complete'
          ? <CompleteState> {
            ...state,
            userDatasetsById: {
              ...state.userDatasetsById,
              [action.payload.userDataset.id]: action.payload.userDataset
            }
          }
          : state;

      case 'user-datasets/detail-remove-success': return state.status === 'complete'
          ? <CompleteState> {
            ...state,
            userDatasets: difference(state.userDatasets, [action.payload.userDataset.id]),
            userDatasetsById: {
              ...state.userDatasetsById,
              [action.payload.userDataset.id]: undefined
            }
          }
          : state

      case 'user-datasets/sharing-success': {
        if (state.status === 'complete') {
          const userDatasetsById = sharingReducer(state.userDatasetsById, action);
          return <CompleteState> {
            ...state,
            userDatasetsById
          }
        }
        return state;
      }

      case 'user-datasets/project-filter-preference-received': {
        if (state.status === 'complete') {
          return <CompleteState> {
            ...state,
            filterByProject: action.payload.filterByProject
          }
        }
        return state;
      }

      default:
        return state;
    }
  }
}
