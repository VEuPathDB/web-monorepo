import {
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
import sharingReducer from '../Components/Sharing/UserDatasetSharingReducer';
export const key = 'userDatasetDetail';
const initialState = {
  userDatasetsById: {},
  userDatasetLoading: false,
  userDatasetUpdating: false,
  userDatasetRemoving: false,
};
/**
 * Stores a map of userDatasets by id. By not storing the current userDataset,
 * we avoid race conditions where the DATASET_DETAIL_RECEIVED actions are
 * dispatched in a different order than the corresponding action creators are
 * invoked.
 */
export function reduce(state = initialState, action) {
  switch (action.type) {
    case DETAIL_LOADING:
      return Object.assign(Object.assign({}, state), {
        userDatasetsById: Object.assign(
          Object.assign({}, state.userDatasetsById),
          {
            [action.payload.id]: {
              isLoading: true,
            },
          }
        ),
      });
    case DETAIL_RECEIVED:
      return Object.assign(Object.assign({}, state), {
        userDatasetLoading: false,
        userDatasetsById: Object.assign(
          Object.assign({}, state.userDatasetsById),
          {
            [action.payload.id]: {
              isLoading: false,
              resource: action.payload.userDataset,
            },
          }
        ),
      });
    case DETAIL_ERROR:
      return Object.assign(Object.assign({}, state), {
        userDatasetLoading: false,
        loadError: action.payload.error,
      });
    case DETAIL_UPDATING:
      return Object.assign(Object.assign({}, state), {
        userDatasetUpdating: true,
        updateError: undefined,
      });
    case DETAIL_UPDATE_SUCCESS:
      return Object.assign(Object.assign({}, state), {
        userDatasetUpdating: false,
        userDatasetsById: Object.assign(
          Object.assign({}, state.userDatasetsById),
          {
            [action.payload.userDataset.id]: {
              isLoading: false,
              resource: action.payload.userDataset,
            },
          }
        ),
      });
    case DETAIL_UPDATE_ERROR:
      return Object.assign(Object.assign({}, state), {
        userDatasetUpdating: false,
        updateError: action.payload.error,
      });
    case DETAIL_REMOVING:
      return Object.assign(Object.assign({}, state), {
        userDatasetRemoving: true,
      });
    case DETAIL_REMOVE_SUCCESS:
      return Object.assign(Object.assign({}, state), {
        userDatasetRemoving: false,
        removalError: undefined,
      });
    case DETAIL_REMOVE_ERROR:
      return Object.assign(Object.assign({}, state), {
        userDatasetRemoving: false,
        removalError: action.payload.error,
      });
    case SHARING_SUCCESS:
      return Object.assign(Object.assign({}, state), {
        userDatasetsById: sharingReducer(state.userDatasetsById, action),
      });
    default:
      return state;
  }
}
//# sourceMappingURL=UserDatasetDetailStoreModule.js.map
