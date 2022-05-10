import { difference } from 'lodash';

import {
  Action,
  LIST_LOADING,
  LIST_RECEIVED,
  LIST_ERROR_RECEIVED,
  DETAIL_UPDATE_SUCCESS,
  DETAIL_REMOVE_SUCCESS,
  SHARING_SUCCESS,
  PROJECT_FILTER,
} from '../Actions/UserDatasetsActions';

import sharingReducer from '../Components/Sharing/UserDatasetSharingReducer';

import { UserDataset } from '../Utils/types';

export const key = 'userDatasetList';

type InitialState = {
  status: 'not-requested';
};

type LoadingState = {
  status: 'loading';
};

type ErrorState = {
  status: 'error';
  loadError: Error;
};

type ForbiddenState = {
  status: 'forbidden';
  loadError: Error;
};

type CompleteState = {
  status: 'complete';
  userDatasets: number[];
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
};

export function reduce(state: State = initialState, action: Action): State {
  switch (action.type) {
    case LIST_LOADING:
      return {
        status: 'loading',
      };

    case LIST_RECEIVED:
      return {
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
      return action.payload.error.status === 403
        ? {
            status: 'forbidden',
            loadError: action.payload.error,
          }
        : {
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
            userDatasetsById: {
              ...state.userDatasetsById,
              [action.payload.userDataset.id]: undefined,
            },
          }
        : state;

    case SHARING_SUCCESS: {
      if (state.status === 'complete') {
        const userDatasetsById = sharingReducer(
          state.userDatasetsById,
          action
        ) as CompleteState['userDatasetsById'];
        return {
          ...state,
          userDatasetsById,
        };
      }
      return state;
    }

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
