import WdkStore, { BaseState } from '../../Core/State/Stores/WdkStore';
import { Favorite } from '../../Utils/WdkModel';
import { MesaState } from '../../Components/Mesa';
import {
  TableStateUpdatedAction,
  TableSelectionUpdatedAction,
  ListLoadingAction,
  ListReceivedAction,
  ListErrorReceivedAction,
  EditCellAction,
  ChangeCellAction,
  CancelCellEditAction,
  SaveCellDataAction,
  SaveReceivedAction,
  SaveErrorReceivedAction,
  DeleteFavoritesAction,
  DeleteErrorReceivedAction,
  SearchTermAction,
  AddErrorAction,
  FilterByTypeAction
} from './FavoritesActionCreators';

type Action =
  TableStateUpdatedAction
  | TableSelectionUpdatedAction
  | ListLoadingAction
  | ListReceivedAction
  | ListErrorReceivedAction
  | EditCellAction
  | ChangeCellAction
  | CancelCellEditAction
  | AddErrorAction
  | SaveReceivedAction
  | SaveCellDataAction
  | SaveErrorReceivedAction
  | DeleteFavoritesAction
  | DeleteErrorReceivedAction
  | SearchTermAction
  | FilterByTypeAction;

export interface State extends BaseState {
  tableState: {};
  tableSelection: number[];

  favoritesLoading: boolean;
  loadError: Error | null;
  existingFavorite: Favorite;
  editCoordinates: {};
  editValue: string;
  saveError: Error | null;
  deleteError: Error | null;
  deletedFavorite: Favorite | null;
  searchText: string;
  key: string;
  filterByType: string;
}

export default class FavoritesListStore extends WdkStore<State> {
  getInitialState() {
    return Object.assign({
      tableState: {},
      tableSelection: [],

      key: '',
      editValue: '',
      searchText: '',
      saveError: null,
      loadError: null,
      deleteError: null,
      filterByType: null,
      editCoordinates: {},
      existingFavorite: {},
      deletedFavorite: null,
      favoritesLoading: false
    }, super.getInitialState());
  }

  handleAction(state: State, action: Action): State {
    switch (action.type) {

      case 'favorites/list-loading': {
        const favoritesLoading = true;
        return { ...state, favoritesLoading };
      }

      case 'favorites/list-received': {
        const favoritesLoading = false;
        const { tableState } = action.payload;
        const predicate = (fav: Favorite) => this.meetsFilterAndSearchCriteria(fav, state);
        const updatedTableState = MesaState.filterRows(tableState, predicate);
        return { ...state, tableState: updatedTableState, favoritesLoading };
      }

      case 'favorites/table-state-updated': {
        const { tableState } = action.payload;
        const predicate = (fav: Favorite) => this.meetsFilterAndSearchCriteria(fav, state);
        const updatedTableState = MesaState.filterRows(tableState, predicate);
        return { ...state, tableState: updatedTableState };
      }

      case 'favorites/table-selection-updated': {
        const { tableSelection } = action.payload;
        return { ...state, tableSelection };
      }

      // If the user visits this page without being logged in, the 403 status code is returned.  The user needs
      // something more meaningful than a generic error message in that case.
      case 'favorites/list-error': {
        const { error } = action.payload;
        if (error.status === 403) {
          return { ...state, favoritesLoading: false };
        } else {
          return { ...state, favoritesLoading: false, loadError: error }
        }
      }

      // State applied when a cell is edited.  The assumption is that only one edit at a time is done.  So
      // if a user clicks edit links consecutively, only the cell for which the last edit link was clicked gains focus.
      // The coordinates of that cell are saved to the editCoordinates variable.  The variable, editValue holds the edited
      // value.  The existingFavorite variable holds the information for the favorite being edited.
      case 'favorites/edit-cell': {
        const { key, value, rowData, coordinates } = action.payload;
        const editValue = value;
        const editCoordinates = coordinates;
        const existingFavorite = Object.assign(state.existingFavorite, rowData);
        return { ...state, key, existingFavorite, editValue, editCoordinates };
      }

      // The variable holding the edited value is updated upon changes.
      case 'favorites/change-cell': {
        const editValue = action.payload;
        return { ...state, editValue };
      }

      // When the edit is cancelled the variable identifying the cell to be edited
      case 'favorites/cancel-cell-edit': {
        const editCoordinates = {};
        return { ...state, editCoordinates };
      }

      case 'favorites/save-received': {
        const editCoordinates = {};
        const { tableState } = action.payload;
        const predicate = (fav: Favorite) => this.meetsFilterAndSearchCriteria(fav, state);
        const updatedTableState = MesaState.filterRows(tableState, predicate);
        return { ...state, tableState: updatedTableState, editCoordinates };
      }

      case 'favorites/save-error': {
        const saveError = action.payload.error;
        return { ...state, saveError };
      }

      case 'favorites/delete-error': {
        const deleteError = action.payload.error;
        return { ...state, deleteError };
      }

      case 'favorites/search-term': {
        const editCoordinates = {};
        const { tableState } = state;
        const searchText = action.payload;
        const stateWithTerm = Object.assign({}, state, { searchText });
        const predicate = (fav: Favorite) => this.meetsFilterAndSearchCriteria(fav, stateWithTerm);
        const updatedTableState = MesaState.filterRows(tableState, predicate);
        return { ...stateWithTerm, editCoordinates, tableState: updatedTableState };
      }

      case 'favorites/filter-by-type': {
        const editCoordinates = {};
        const { tableState } = state;
        const filterByType = action.payload;
        const stateWithFilter = Object.assign({}, state, { filterByType });
        const predicate = (fav: Favorite) => this.meetsFilterAndSearchCriteria(fav, stateWithFilter);
        const updatedTableState = MesaState.filterRows(tableState, predicate);
        return { ...stateWithFilter, editCoordinates, tableState: updatedTableState };
      }

      default:
        return state;
    }
  }

  meetsFilterAndSearchCriteria (favorite: Favorite, state: State) {
    let { filterByType, searchText } = state;
    searchText = searchText.toLowerCase();

    return (!filterByType || favorite.recordClassName === filterByType) &&
    (!searchText ||
      (favorite.displayName.toLowerCase().indexOf(searchText) > -1) ||
      (this._getType(favorite, state).toLowerCase().indexOf(searchText) > -1) ||
      (favorite.description != null && favorite.description.toLowerCase().indexOf(searchText) > -1) ||
      (favorite.group != null && favorite.group.toLowerCase().indexOf(searchText) > -1)
    );
  }

  _getType (favorite:Favorite, state:State) {
    if (state.globalData.recordClasses == null) return 'Unknown';
    let recordClass = state.globalData.recordClasses.find((recordClass) => recordClass.name === favorite.recordClassName);
    return recordClass == null ? 'Unknown' : recordClass.displayName;
  }
}
