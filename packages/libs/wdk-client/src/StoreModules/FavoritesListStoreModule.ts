import { difference, union } from 'lodash';
import { map, filter } from 'rxjs/operators';
import { Favorite, RecordClass } from '../Utils/WdkModel';
import { MesaState } from '@veupathdb/coreui/lib/components/Mesa';
import {
  TYPE_GETTER,
  SORT_TABLE,
  START_FAVORITES_REQUEST,
  END_FAVORITES_REQUEST_WITH_SUCCESS,
  END_FAVORITES_REQUEST_WITH_ERROR,
  UPDATE_TABLE_STATE,
  UPDATE_TABLE_SELECTION,
  EDIT_CELL,
  CHANGE_CELL_VALUE,
  CANCEL_CELL_EDIT,
  END_SAVE_CELL_WITH_SUCCESS,
  END_SAVE_CELL_WITH_ERROR,
  END_DELETE_WITH_ERROR,
  UPDATE_SEARCH_TERM,
  FILTER_BY_TYPE,
  createTypeGetter,
} from '../Actions/FavoritesActions';
import { EpicDependencies } from '../Core/Store';
import { Observable } from 'rxjs';
import { Action } from '../Actions';

export const key = 'favorites';

export interface State {
  tableState?: {};
  tableSelection: number[];
  favoritesLoading: boolean;
  loadError: Error | null;
  existingFavorite: Partial<Favorite>;
  editCoordinates: {};
  editValue: string;
  saveError: Error | null;
  deleteError: Error | null;
  deletedFavorite: Favorite | null;
  searchText: string;
  key: string;
  filterByType: string | null;
  typeGetter: (favorite: Favorite, state: State) => string;
}

const initialState = {
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
  favoritesLoading: false,
  typeGetter: () => 'Unknown',
};

export function reduce(state: State = initialState, action: Action): State {
  switch (action.type) {
    case TYPE_GETTER: {
      const { recordClasses } = action.payload;
      return { ...state, typeGetter: typeGetterFactory(recordClasses) };
    }

    case SORT_TABLE: {
      const { setSortDirection, setSortColumnKey } = MesaState;
      const { sortDirection, sortKey } = action.payload;
      const tableState = setSortDirection(
        setSortColumnKey(state.tableState, sortKey),
        sortDirection
      );
      return { ...state, tableState };
    }

    case START_FAVORITES_REQUEST: {
      const favoritesLoading = true;
      return { ...state, favoritesLoading };
    }

    case END_FAVORITES_REQUEST_WITH_SUCCESS: {
      const favoritesLoading = false;
      const { tableState } = action.payload;
      const predicate = (fav: Favorite) =>
        meetsFilterAndSearchCriteria(fav, state);
      const updatedTableState = MesaState.filterRows(tableState, predicate);
      return { ...state, tableState: updatedTableState, favoritesLoading };
    }

    case UPDATE_TABLE_STATE: {
      const { tableState } = action.payload;
      const predicate = (fav: Favorite) =>
        meetsFilterAndSearchCriteria(fav, state);
      const updatedTableState = MesaState.filterRows(tableState, predicate);
      return { ...state, tableState: updatedTableState };
    }

    case UPDATE_TABLE_SELECTION: {
      const { selectIds = [], deselectIds = [] } = action.payload;
      const tableSelection = difference(
        union(state.tableSelection, selectIds),
        deselectIds
      );
      return { ...state, tableSelection };
    }

    // If the user visits this page without being logged in, the 403 status code is returned.  The user needs
    // something more meaningful than a generic error message in that case.
    case END_FAVORITES_REQUEST_WITH_ERROR: {
      const { error } = action.payload;
      if (error.status === 403) {
        return { ...state, favoritesLoading: false };
      } else {
        return { ...state, favoritesLoading: false, loadError: error };
      }
    }

    // State applied when a cell is edited.  The assumption is that only one edit at a time is done.  So
    // if a user clicks edit links consecutively, only the cell for which the last edit link was clicked gains focus.
    // The coordinates of that cell are saved to the editCoordinates variable.  The variable, editValue holds the edited
    // value.  The existingFavorite variable holds the information for the favorite being edited.
    case EDIT_CELL: {
      const { key, value, rowData, coordinates } = action.payload;
      const editValue = value;
      const editCoordinates = coordinates;
      const existingFavorite = Object.assign(state.existingFavorite, rowData);
      return { ...state, key, existingFavorite, editValue, editCoordinates };
    }

    // The variable holding the edited value is updated upon changes.
    case CHANGE_CELL_VALUE: {
      const editValue = action.payload;
      return { ...state, editValue };
    }

    // When the edit is cancelled the variable identifying the cell to be edited
    case CANCEL_CELL_EDIT: {
      const editCoordinates = {};
      return { ...state, editCoordinates };
    }

    case END_SAVE_CELL_WITH_SUCCESS: {
      const editCoordinates = {};
      const { tableState } = action.payload;
      const predicate = (fav: Favorite) =>
        meetsFilterAndSearchCriteria(fav, state);
      const updatedTableState = MesaState.filterRows(tableState, predicate);
      return { ...state, tableState: updatedTableState, editCoordinates };
    }

    case END_SAVE_CELL_WITH_ERROR: {
      const saveError = action.payload.error;
      return { ...state, saveError };
    }

    case END_DELETE_WITH_ERROR: {
      const deleteError = action.payload.error;
      return { ...state, deleteError };
    }

    case UPDATE_SEARCH_TERM: {
      const editCoordinates = {};
      const { tableState } = state;
      const searchText = action.payload;
      const stateWithTerm = Object.assign({}, state, { searchText });
      const predicate = (fav: Favorite) =>
        meetsFilterAndSearchCriteria(fav, stateWithTerm);
      const updatedTableState = MesaState.filterRows(tableState, predicate);
      return {
        ...stateWithTerm,
        editCoordinates,
        tableState: updatedTableState,
      };
    }

    case FILTER_BY_TYPE: {
      const editCoordinates = {};
      const { tableState } = state;
      const filterByType = action.payload;
      const stateWithFilter = Object.assign({}, state, { filterByType });
      const predicate = (fav: Favorite) =>
        meetsFilterAndSearchCriteria(fav, stateWithFilter);
      const updatedTableState = MesaState.filterRows(tableState, predicate);
      return {
        ...stateWithFilter,
        editCoordinates,
        tableState: updatedTableState,
      };
    }

    default:
      return state;
  }
}

export function observe(
  action$: Observable<any>,
  state$: Observable<any>,
  dependencies: EpicDependencies
) {
  return action$.pipe(
    filter(({ type }) => type === 'static/recordClasses-loaded'),
    map(({ payload: { recordClasses } }) => createTypeGetter(recordClasses))
  );
}

function meetsFilterAndSearchCriteria(favorite: Favorite, state: State) {
  let { filterByType, searchText = '', typeGetter = () => 'Unknown' } = state;
  searchText = searchText.toLowerCase();

  return (
    (!filterByType || favorite.recordClassName === filterByType) &&
    (!searchText ||
      favorite.displayName.toLowerCase().indexOf(searchText) > -1 ||
      typeGetter(favorite, state).toLowerCase().indexOf(searchText) > -1 ||
      (favorite.description != null &&
        favorite.description.toLowerCase().indexOf(searchText) > -1) ||
      (favorite.group != null &&
        favorite.group.toLowerCase().indexOf(searchText) > -1))
  );
}

const typeGetterFactory =
  (recordClasses: RecordClass[]) => (favorite: Favorite, state: State) => {
    if (recordClasses == null) {
      return 'Unknown';
    }

    const recordClass = recordClasses.find(
      (recordClass) => recordClass.fullName === favorite.recordClassName
    );

    return recordClass == null ? 'Unknown' : recordClass.displayName;
  };
