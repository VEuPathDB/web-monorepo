import { difference } from 'lodash';
import {
  LIST_LOADING,
  LIST_RECEIVED,
  LIST_ERROR_RECEIVED,
  DETAIL_UPDATE_SUCCESS,
  DETAIL_REMOVE_SUCCESS,
  SHARING_SUCCESS,
  PROJECT_FILTER,
} from '../Actions/UserDatasetsActions';
import sharingReducer from '../Components/Sharing/UserDatasetSharingReducer';
export const key = 'userDatasetList';
const initialState = {
  status: 'not-requested',
};
export function reduce(state = initialState, action) {
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
          {}
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
        ? Object.assign(Object.assign({}, state), {
            userDatasetsById: Object.assign(
              Object.assign({}, state.userDatasetsById),
              {
                [action.payload.userDataset.id]: {
                  isLoading: false,
                  resource: action.payload.userDataset,
                },
              }
            ),
          })
        : state;
    case DETAIL_REMOVE_SUCCESS:
      return state.status === 'complete'
        ? Object.assign(Object.assign({}, state), {
            userDatasets: difference(state.userDatasets, [
              action.payload.userDataset.id,
            ]),
            userDatasetsById: Object.assign(
              Object.assign({}, state.userDatasetsById),
              { [action.payload.userDataset.id]: undefined }
            ),
          })
        : state;
    case SHARING_SUCCESS: {
      if (state.status === 'complete') {
        const userDatasetsById = sharingReducer(state.userDatasetsById, action);
        return Object.assign(Object.assign({}, state), { userDatasetsById });
      }
      return state;
    }
    case PROJECT_FILTER: {
      if (state.status === 'complete') {
        return Object.assign(Object.assign({}, state), {
          filterByProject: action.payload.filterByProject,
        });
      }
      return state;
    }
    default:
      return state;
  }
}
//# sourceMappingURL=UserDatasetListStoreModule.js.map
