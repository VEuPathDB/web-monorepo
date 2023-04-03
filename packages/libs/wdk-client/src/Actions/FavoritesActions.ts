import { ActionThunk } from '../Core/WdkMiddleware';
import { Favorite, RecordClass } from '../Utils/WdkModel';
import { ServiceError } from '../Service/ServiceError';
import { MesaState } from '../Components/Mesa';

// Types
// -----

// FIXME Determine the actual type from Mesa
type TableState = {};

export type Action =
  | SortTableAction
  | StartFavoritesRequestAction
  | EndFavoritesRequestWithErrorAction
  | EndFavoritesRequestWithSucessAction
  | UpdateTableStateAction
  | UpdateTableSelectionAction
  | CreateTypeGetterAction
  | EditCellAction
  | ChangeCellValueAction
  | StartSaveCellDataAction
  | EndSaveCellWithErrorAction
  | EndSaveCellWithSuccessAction
  | CancelCellEditAction
  | StartDeleteAction
  | StartUndeleteAction
  | EndAddWithSuccessAction
  | EndAddWithErrorAction
  | EndDeleteWithErrorAction
  | EndUndeleteWithSuccessAction
  | UpdateSearchTermAction
  | FilterByTypeAction;

//==============================================================================

export const UPDATE_TABLE_STATE = 'favorites/update-table-state';

export interface UpdateTableStateAction {
  type: typeof UPDATE_TABLE_STATE;
  payload: {
    tableState: TableState;
  };
}

export function updateTableState(
  tableState: TableState
): UpdateTableStateAction {
  return {
    type: UPDATE_TABLE_STATE,
    payload: {
      tableState,
    },
  };
}

//==============================================================================

export const SORT_TABLE = 'favorites/sort-table';

export interface SortTableAction {
  type: typeof SORT_TABLE;
  payload: {
    sortKey: string;
    sortDirection: 'ASC' | 'DESC';
  };
}

export function sortTable(
  sortKey: string,
  sortDirection: 'ASC' | 'DESC'
): SortTableAction {
  return {
    type: SORT_TABLE,
    payload: {
      sortKey,
      sortDirection,
    },
  };
}

//==============================================================================

export const UPDATE_TABLE_SELECTION = 'favorites/update-table-selection';

export interface UpdateTableSelectionAction {
  type: typeof UPDATE_TABLE_SELECTION;
  payload: {
    selectIds: number[];
    deselectIds: number[];
  };
}

export function updateTableSelection(
  payload: UpdateTableSelectionAction['payload']
): UpdateTableSelectionAction {
  return {
    type: UPDATE_TABLE_SELECTION,
    payload,
  };
}

//==============================================================================

export const TYPE_GETTER = 'favorites/create-type-getter';

export interface CreateTypeGetterAction {
  type: typeof TYPE_GETTER;
  payload: {
    recordClasses: RecordClass[];
  };
}

export function createTypeGetter(
  recordClasses: RecordClass[]
): CreateTypeGetterAction {
  return {
    type: TYPE_GETTER,
    payload: {
      recordClasses,
    },
  };
}

//==============================================================================

export const START_FAVORITES_REQUEST = 'favorites/start-request';

export interface StartFavoritesRequestAction {
  type: typeof START_FAVORITES_REQUEST;
}

export function startFavoritesRequest(): StartFavoritesRequestAction {
  return {
    type: START_FAVORITES_REQUEST,
  };
}

//==============================================================================

export const END_FAVORITES_REQUEST_WITH_ERROR =
  'favorites/end-request-with-error';

export interface EndFavoritesRequestWithErrorAction {
  type: typeof END_FAVORITES_REQUEST_WITH_ERROR;
  payload: {
    error: ServiceError;
  };
}

export function endFavoritesRequestWithError(
  error: ServiceError
): EndFavoritesRequestWithErrorAction {
  return {
    type: END_FAVORITES_REQUEST_WITH_ERROR,
    payload: {
      error,
    },
  };
}

//==============================================================================

export const END_FAVORITES_REQUEST_WITH_SUCCESS =
  'favorites/end-request-with-success';

export interface EndFavoritesRequestWithSucessAction {
  type: typeof END_FAVORITES_REQUEST_WITH_SUCCESS;
  payload: {
    tableState: TableState;
  };
}

export function endFavoritesRequestWithSucess(
  tableState: TableState
): EndFavoritesRequestWithSucessAction {
  return {
    type: END_FAVORITES_REQUEST_WITH_SUCCESS,
    payload: {
      tableState,
    },
  };
}

//==============================================================================

export const EDIT_CELL = 'favorites/edit-cell';

export interface EditCellAction {
  type: typeof EDIT_CELL;
  payload: {
    // FIXME What is this type?
    coordinates: {};
    key: string;
    value: string;
    rowData: Favorite;
  };
}

export function editCell(payload: EditCellAction['payload']): EditCellAction {
  return {
    type: EDIT_CELL,
    payload,
  };
}

//==============================================================================

export const CHANGE_CELL_VALUE = 'favorites/change-cell-value';

export interface ChangeCellValueAction {
  type: typeof CHANGE_CELL_VALUE;
  payload: string;
}

export function changeCellValue(value: string): ChangeCellValueAction {
  return {
    type: CHANGE_CELL_VALUE,
    payload: value,
  };
}

//==============================================================================

export const START_SAVE_CELL_DATA = 'favorites/start-save-cell-data';

export interface StartSaveCellDataAction {
  type: typeof START_SAVE_CELL_DATA;
}

export function startSaveCellData(): StartSaveCellDataAction {
  return {
    type: START_SAVE_CELL_DATA,
  };
}

//==============================================================================

export const END_SAVE_CELL_WITH_SUCCESS =
  'favorites/end-save-cell-with-success';

export interface EndSaveCellWithSuccessAction {
  type: typeof END_SAVE_CELL_WITH_SUCCESS;
  payload: {
    tableState: TableState;
  };
}

export function endSaveCellWithSuccess(
  tableState: TableState
): EndSaveCellWithSuccessAction {
  return {
    type: END_SAVE_CELL_WITH_SUCCESS,
    payload: {
      tableState,
    },
  };
}

//==============================================================================

export const END_SAVE_CELL_WITH_ERROR = 'favorites/end-save-cell-with-error';

export interface EndSaveCellWithErrorAction {
  type: typeof END_SAVE_CELL_WITH_ERROR;
  payload: {
    error: ServiceError;
  };
}

export function endSaveCellWithError(
  error: ServiceError
): EndSaveCellWithErrorAction {
  return {
    type: END_SAVE_CELL_WITH_ERROR,
    payload: {
      error,
    },
  };
}

//==============================================================================

export const CANCEL_CELL_EDIT = 'favorites/cancel-cell-edit';

export interface CancelCellEditAction {
  type: typeof CANCEL_CELL_EDIT;
}

export function cancelCellEdit(): CancelCellEditAction {
  return {
    type: CANCEL_CELL_EDIT,
  };
}

//==============================================================================

export const START_DELETE = 'favorites/start-delete';

export interface StartDeleteAction {
  type: typeof START_DELETE;
}

export function startDelete(): StartDeleteAction {
  return {
    type: START_DELETE,
  };
}

//==============================================================================

export const END_DELETE_WITH_ERROR = 'favorites/end-delete-with-error';

export interface EndDeleteWithErrorAction {
  type: typeof END_DELETE_WITH_ERROR;
  payload: {
    error: ServiceError;
  };
}

export function endDeleteWithError(
  error: ServiceError
): EndDeleteWithErrorAction {
  return {
    type: END_DELETE_WITH_ERROR,
    payload: {
      error,
    },
  };
}

//==============================================================================

export const START_UNDELETE = 'favorites/start-undelete';

export interface StartUndeleteAction {
  type: typeof START_UNDELETE;
}

export function startUndelete(): StartUndeleteAction {
  return {
    type: START_UNDELETE,
  };
}

//==============================================================================

export const END_UNDELETE_WITH_SUCCESS = 'favorites/end-undelete-with-success';

export interface EndUndeleteWithSuccessAction {
  type: typeof END_UNDELETE_WITH_SUCCESS;
  payload: {
    undeletedFavorites: Favorite[];
  };
}

export function endUndeleteWithSuccess(
  undeletedFavorites: Favorite[]
): EndUndeleteWithSuccessAction {
  return {
    type: END_UNDELETE_WITH_SUCCESS,
    payload: {
      undeletedFavorites,
    },
  };
}

//==============================================================================

export const END_ADD_WITH_SUCCESS = 'favorites/end-add-with-success';

export interface EndAddWithSuccessAction {
  type: typeof END_ADD_WITH_SUCCESS;
  payload: {
    addedFavorite: Favorite;
  };
}

export function endAddWithSuccess(
  addedFavorite: Favorite
): EndAddWithSuccessAction {
  return {
    type: END_ADD_WITH_SUCCESS,
    payload: {
      addedFavorite,
    },
  };
}

//==============================================================================

export const END_ADD_WITH_ERROR = 'favorites/end-add-with-error';

export interface EndAddWithErrorAction {
  type: typeof END_ADD_WITH_ERROR;
  payload: {
    error: ServiceError;
  };
}

export function endAddWithError(error: ServiceError): EndAddWithErrorAction {
  return {
    type: END_ADD_WITH_ERROR,
    payload: {
      error,
    },
  };
}

//==============================================================================

export const UPDATE_SEARCH_TERM = 'favorites/update-search-term';

export interface UpdateSearchTermAction {
  type: typeof UPDATE_SEARCH_TERM;
  payload: string;
}

export function updateSearchTerm(searchTerm: string): UpdateSearchTermAction {
  return {
    type: UPDATE_SEARCH_TERM,
    payload: searchTerm,
  };
}

//==============================================================================

export const FILTER_BY_TYPE = 'favorites/filter-by-type';

export interface FilterByTypeAction {
  type: typeof FILTER_BY_TYPE;
  payload: string | null;
}

export function filterByType(typeName: string | null): FilterByTypeAction {
  return {
    type: FILTER_BY_TYPE,
    payload: typeName,
  };
}

//==============================================================================

// Thunks
// -------

type ListAction =
  | StartFavoritesRequestAction
  | EndFavoritesRequestWithSucessAction
  | EndFavoritesRequestWithErrorAction
  | UpdateTableStateAction;

type SaveAction =
  | StartSaveCellDataAction
  | EndSaveCellWithSuccessAction
  | EndSaveCellWithErrorAction
  | UpdateTableStateAction;

type DeleteAction =
  | StartDeleteAction
  | EndDeleteWithErrorAction
  | UpdateTableStateAction;

type AddAction =
  | StartUndeleteAction
  | EndAddWithErrorAction
  | UpdateTableStateAction;

export function loadFavoritesList(): ActionThunk<ListAction> {
  return function run({ wdkService }) {
    return [
      startFavoritesRequest(),
      wdkService.getCurrentFavorites().then(
        (rows) => {
          const newTableState = MesaState.create({ rows });
          return endFavoritesRequestWithSucess(newTableState);
        },
        (error: ServiceError) => endFavoritesRequestWithError(error)
      ),
    ];
  };
}

export function saveCellData(
  tableState: {},
  updatedFavorite: Favorite
): ActionThunk<SaveAction> {
  return ({ wdkService }) => {
    const rows = MesaState.getRows(tableState);
    const updatedRows = rows.map((fav: Favorite) =>
      fav.id === updatedFavorite.id ? updatedFavorite : fav
    );
    const updatedTableState = MesaState.setRows(tableState, updatedRows);

    return [
      startSaveCellData(),
      wdkService.saveFavorite(updatedFavorite).then(
        () => endSaveCellWithSuccess(updatedTableState),
        (error: ServiceError) => endSaveCellWithError(error)
      ),
    ];
  };
}

export function deleteFavorites(
  tableState: {},
  deletedFavorites: Favorite[]
): ActionThunk<DeleteAction> {
  return ({ wdkService }) => {
    const deletedIds = deletedFavorites.map((fav: Favorite) => fav.id);
    const rows = MesaState.getRows(tableState);
    const updatedRows = rows.filter(
      (fav: Favorite) => !deletedIds.includes(fav.id)
    );
    const updatedTableState = MesaState.setRows(tableState, updatedRows);

    return [
      startDelete(),
      wdkService.deleteFavorites(deletedIds).then(
        () => updateTableState(updatedTableState),
        (error: ServiceError) => endDeleteWithError(error)
      ),
    ];
  };
}

export function undeleteFavorites(
  tableState: {},
  undeletedFavorites: Favorite[]
): ActionThunk<AddAction> {
  return ({ wdkService }) => {
    const ids = undeletedFavorites.map((favorite) => favorite.id);
    const rows = MesaState.getRows(tableState);
    const updatedTableState = MesaState.setRows(tableState, [
      ...rows,
      ...undeletedFavorites,
    ]);

    return [
      startUndelete(),
      wdkService.undeleteFavorites(ids).then(
        () => updateTableState(updatedTableState),
        (error: ServiceError) => endAddWithError(error)
      ),
    ];
  };
}
