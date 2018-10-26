import { ActionThunk } from 'wdk-client/Utils/ActionCreatorUtils';
import { Favorite, RecordClass } from 'wdk-client/Utils/WdkModel';
import { ServiceError } from 'wdk-client/Utils/WdkService';
import { MesaState, MesaSelection } from 'wdk-client/Components/Mesa';


export type TableStateUpdatedAction = {
  type: 'favorites/table-state-updated',
  payload: {
    tableState: {}
  }
};

export type TableSelectionUpdatedAction = {
  type: 'favorites/table-selection-updated',
  payload: {
    tableSelection: number[]
  }
};

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

export type CreateTypeGetterAction = {
  type: 'favorites/create-type-getter',
  payload: {
    recordClasses: RecordClass[]
  }
};

export type ListLoadingAction = {
  type: 'favorites/list-loading'
}

export type ListErrorReceivedAction = {
  type: 'favorites/list-error',
  payload: {
    error: ServiceError
  }
}

export type ListReceivedAction = {
  type: 'favorites/list-received',
  payload: {
    tableState: {}
  }
}

export type EditCellAction = {
  type: 'favorites/edit-cell'
  payload: {
    coordinates: {}
    key: string
    value: string
    rowData: Favorite
  }
}

export type ChangeCellAction = {
  type: 'favorites/change-cell'
  payload: string
}

export type SaveCellDataAction = {
  type: 'favorites/save-cell-data'
}

export type SaveReceivedAction = {
  type: 'favorites/save-received'
  payload: { tableState : {} }
}

export type SaveErrorReceivedAction = {
  type: 'favorites/save-error'
  payload: {
    error: ServiceError
  }
}

export type CancelCellEditAction = {
  type: 'favorites/cancel-cell-edit'
}

export type DeleteFavoritesAction = {
  type: 'favorites/delete-favorites'
}

export type UndeleteFavoritesAction = {
  type: 'favorites/undelete-favorites'
}

export type DeleteErrorReceivedAction = {
  type: 'favorites/delete-error'
  payload: {
    error: ServiceError
  }
}

export type AddReceivedAction = {
  type: 'favorites/add-received'
  payload: {
    addedFavorite: Favorite
  }
}

export type UndeletedRowsReceivedAction = {
  type: 'favorites/undeleted-rows-received'
  payload: {
    undeletedFavorites: Favorite[]
  }
}

export type AddErrorAction = {
  type: 'favorites/add-error'
  payload: {
    error: ServiceError
  }
}

export type SearchTermAction = {
    type: 'favorites/search-term'
    payload: string
}

export type FilterByTypeAction = {
  type: 'favorites/filter-by-type'
  payload: string
}

type ListAction = ListLoadingAction|ListErrorReceivedAction|ListReceivedAction|TableStateUpdatedAction;
type SaveAction = SaveCellDataAction|SaveReceivedAction|SaveErrorReceivedAction|TableStateUpdatedAction;
type DeleteAction = DeleteFavoritesAction|DeleteErrorReceivedAction|TableStateUpdatedAction;
type AddAction = AddErrorAction|UndeleteFavoritesAction|TableStateUpdatedAction;

export function createTypeGetter(recordClasses: RecordClass[]): CreateTypeGetterAction {
  return {
    type: 'favorites/create-type-getter',
    payload: {
      recordClasses
    }
  }
}

export function loadFavoritesList (): ActionThunk<ListAction>{
  return function run ({ wdkService }) {
    return [
      { type: 'favorites/list-loading' },
      wdkService.getCurrentFavorites()
        .then(rows => {
            const newTableState = MesaState.create({ rows });
            return {
              type: 'favorites/list-received',
              payload: { tableState: newTableState }
            } as ListAction;
          },
          (error: ServiceError) => {
            return {type: 'favorites/list-error', payload: {error}} as ListAction;
          }
        )
      ];
  }
}

export function selectMultipleFavorites (tableSelection: Favorite['id'][], ids: Favorite['id'][]): TableSelectionUpdatedAction {
  const updatedSelection = MesaSelection.addIdsToSelection(tableSelection, ids);
  return {
    type: 'favorites/table-selection-updated',
    payload: { tableSelection: updatedSelection }
  };
}

export function deselectMultipleFavorites (tableSelection: Favorite['id'][], ids: Favorite['id'][]): TableSelectionUpdatedAction {
  const updatedSelection = MesaSelection.removeIdsFromSelection(tableSelection, ids);
  return {
    type: 'favorites/table-selection-updated',
    payload: { tableSelection: updatedSelection }
  };
}

export function selectFavorite (tableSelection: Favorite['id'][], id: Favorite['id']): TableSelectionUpdatedAction {
  const updatedSelection = MesaSelection.addIdToSelection(tableSelection, id);
  return {
    type: 'favorites/table-selection-updated',
    payload: { tableSelection: updatedSelection }
  };
}

export function deselectFavorite (tableSelection: Favorite['id'][], id: Favorite['id']): TableSelectionUpdatedAction {
  const updatedSelection = MesaSelection.removeIdFromSelection(tableSelection, id);
  return {
    type: 'favorites/table-selection-updated',
    payload: { tableSelection: updatedSelection }
  };
}

// Editing Cells -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

export function editCell (data: EditCellAction['payload']): EditCellAction {
  return {
    type: 'favorites/edit-cell',
    payload: data
  };
}

export function changeCell (value: string): ChangeCellAction {
  return {
    type: 'favorites/change-cell',
    payload: value
  };
}

export function cancelCellEdit (): CancelCellEditAction {
  return { type: 'favorites/cancel-cell-edit' };
}

export function saveCellData (tableState: {}, updatedFavorite: Favorite): ActionThunk<SaveAction> {
  return ({ wdkService }) => {
    const rows = MesaState.getRows(tableState);
    const updatedRows = rows.map((fav: Favorite) => fav.id === updatedFavorite.id ? updatedFavorite : fav);
    const updatedTableState = MesaState.setRows(tableState, updatedRows);

    return [
      { type: 'favorites/save-cell-data' },
      wdkService.saveFavorite(updatedFavorite).then(
        () => ({ type: 'favorites/save-received', payload: { tableState: updatedTableState } } as SaveAction),
        (error: ServiceError) => ({ type: 'favorites/save-error', payload: { error } } as SaveAction)
      )
    ];
  };
}

export function deleteFavorites (tableState: {}, deletedFavorites: Favorite[]): ActionThunk <DeleteAction> {
  return ({ wdkService }) => {
    const deletedIds = deletedFavorites.map((fav: Favorite) => fav.id);
    const rows = MesaState.getRows(tableState);
    const updatedRows = rows.filter((fav: Favorite) => !deletedIds.includes(fav.id));
    const updatedTableState = MesaState.setRows(tableState, updatedRows);

    return [
      { type: 'favorites/delete-favorites' },
      wdkService.deleteFavorites(deletedIds).then(
        () => ({ type: 'favorites/table-state-updated', payload: { tableState: updatedTableState } } as DeleteAction),
        (error: ServiceError) => ({ type: 'favorites/delete-error', payload: { error } } as DeleteAction)
      )
    ]
  }
}

export function searchTerm (term: string): SearchTermAction {
  return {
    type: 'favorites/search-term',
    payload: term
  };
}

export function sortColumn(tableState: {}, sortByKey: string, sortDirection: string): TableStateUpdatedAction {
  const { setSortDirection, setSortColumnKey } = MesaState;
  const updatedTableState = setSortDirection(setSortColumnKey(tableState, sortByKey), sortDirection);
  return {
    type: 'favorites/table-state-updated',
    payload: { tableState: updatedTableState }
  };
}

export function filterByType(recordType: string): FilterByTypeAction {
  return {
    type: 'favorites/filter-by-type',
    payload: recordType
  };
}

export function undeleteFavorites (tableState: {}, undeletedFavorites: Favorite[]): ActionThunk<AddAction> {
  return ({ wdkService }) => {
    const ids = undeletedFavorites.map((favorite) => favorite.id);
    const rows = MesaState.getRows(tableState);
    const updatedTableState = MesaState.setRows(tableState, [...rows, ...undeletedFavorites]);

    return [
      { type: 'favorites/undelete-favorites' },
      wdkService.undeleteFavorites(ids).then(
        () => ({ type: 'favorites/table-state-updated', payload: { tableState: updatedTableState } } as AddAction),
        (error: ServiceError) => ({ type: 'favorites/add-error', payload: { error } } as AddAction)
      )
    ];
  };
}
