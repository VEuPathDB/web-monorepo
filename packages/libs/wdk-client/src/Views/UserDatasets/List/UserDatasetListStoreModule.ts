import { UserDataset } from 'wdk-client/Utils/WdkModel';
import sharingReducer from 'wdk-client/Views/UserDatasets/Sharing/UserDatasetSharingReducer';
import {
  DetailRemoveSuccessAction,
  DetailUpdateErrorAction,
  DetailUpdateSuccessAction,
  ListErrorReceivedAction,
  ListLoadingAction,
  ListReceivedAction,
  ProjectFilterAction,
  SharingSuccessAction,
} from 'wdk-client/Views/UserDatasets/UserDatasetsActionCreators';
import { difference } from 'lodash';

export const key = 'userDatasetList';

type Action = ListLoadingAction
  | ListReceivedAction
  | ListErrorReceivedAction
  | DetailUpdateErrorAction
  | DetailUpdateSuccessAction
  | DetailRemoveSuccessAction
  | SharingSuccessAction
  | ProjectFilterAction;

type InitialState = {
  status: 'not-requested';
}

type LoadingState = {
  status: 'loading';
}

type ErrorState = {
  status: 'error';
  loadError: Error;
}

type ForbiddenState = {
  status: 'forbidden';
  loadError: Error;
}

type CompleteState = {
  status: 'complete';
  userDatasets: number[];
  userDatasetsById: Record<string, { isLoading: false; resource: UserDataset }>;
  filterByProject: boolean;
}

export type State =  InitialState | LoadingState | ErrorState | ForbiddenState | CompleteState;

const initialState: State = {
  status: 'not-requested'
}

export function reduce(state: State = initialState, action: Action): State {
  switch (action.type) {
    case 'user-datasets/list-loading': return <LoadingState> {
      status: 'loading'
    };

    case 'user-datasets/list-received': return <CompleteState> {
      status: 'complete',
      filterByProject: action.payload.filterByProject,
      userDatasets: action.payload.userDatasets.map(ud => ud.id),
      userDatasetsById: action.payload.userDatasets.reduce((uds, ud) =>
        Object.assign(uds, { [ud.id]: { loading: false, resource: ud }}), {} as CompleteState['userDatasetsById'])
    };

    case 'user-datasets/list-error': return <ErrorState|ForbiddenState>{
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
