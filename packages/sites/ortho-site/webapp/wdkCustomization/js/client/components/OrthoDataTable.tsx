import React, { useMemo, useState } from 'react';

import { orderBy } from 'lodash';

import { RealTimeSearchBox } from 'wdk-client/Components';
import { Mesa, MesaState } from 'wdk-client/Components/Mesa';

import {
  DataTableColumnKey,
  DataTableColumns,
  DataTableSortObject
} from 'ortho-client/utils/dataTables';

interface Props<R, C extends DataTableColumnKey<R>> {
  rows: R[];
  columns: DataTableColumns<R, C>;
  columnOrder: readonly C[];
  onRowMouseOver?: (row: R) => void;
  onRowMouseOut?: (row: R) => void;
}

export function OrthoDataTable<R, C extends DataTableColumnKey<R>>(
  { rows, columns, columnOrder, onRowMouseOver, onRowMouseOut }: Props<R, C>
) {
  const [ searchTerm, setSearchTerm ] = useState('');

  const initialSortUiState: DataTableSortObject<R, C> =
    { columnKey: columns[columnOrder[0]].key, direction: 'asc' };
  const [ sortUiState, setSortUiState ] = useState(initialSortUiState);

  const mesaRows = useMemo(
    () => makeMesaRows(rows, columns, sortUiState),
    [ rows, columns, sortUiState ]
  );

  const mesaFilteredRows = useMemo(
    () => makeMesaFilteredRows(mesaRows, columns, columnOrder, searchTerm),
    [ mesaRows, columns, columnOrder, searchTerm ]
  );

  const mesaColumns = useMemo(() => makeMesaColumns(columns, columnOrder), [ columns, columnOrder ]);

  const mesaOptions = useMemo(
    () => makeMesaOptions(onRowMouseOver, onRowMouseOut),
    [ onRowMouseOver, onRowMouseOut ]
  );
  const mesaEventHandlers = useMemo(() => makeMesaEventHandlers(setSortUiState), []);
  const mesaUiState = useMemo(() => makeMesaUiState(sortUiState), [ sortUiState ]);

  const mesaState = useMemo(
    () => MesaState.create({
      rows: mesaRows,
      filteredRows: mesaFilteredRows,
      columns: mesaColumns,
      options: mesaOptions,
      eventHandlers: mesaEventHandlers,
      uiState: mesaUiState
    }),
    [ mesaRows, mesaFilteredRows, mesaColumns, mesaOptions, mesaEventHandlers, mesaUiState ]
  );

  return (
    <div className="GraphInformationDataTable">
      <Mesa state={mesaState}>
        <div className="SearchBoxContainer">
          <span>Search: </span>
          <RealTimeSearchBox
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            helpText="The entire table will be searched"
          />
        </div>
      </Mesa>
    </div>
  );
}

function makeMesaRows<R, C extends DataTableColumnKey<R>>(
  rows: Props<R, C>['rows'],
  columns: Props<R, C>['columns'],
  sortUiState: DataTableSortObject<R, C>
) {
  const { columnKey: sortKey, direction: sortDirection } = sortUiState;

  const makeOrder = columns[sortKey].makeOrder;

  return makeOrder == null
    ? orderBy(rows, sortKey, sortDirection)
    : orderBy(rows, makeOrder, sortDirection);
}

function makeMesaFilteredRows<R, C extends DataTableColumnKey<R>>(
  rows: Props<R, C>['rows'],
  columns: Props<R, C>['columns'],
  columnOrder: Props<R, C>['columnOrder'],
  searchTerm: string
) {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  return rows.filter(
    row => columnOrder.some(columnKey => {
      const { makeSearchableString } = columns[columnKey];

      const searchableString = makeSearchableString == null
        ? String(row[columnKey])
        : makeSearchableString(row[columnKey]);

      return searchableString.toLowerCase().includes(normalizedSearchTerm);
    })
  );
}

function makeMesaColumns<R, C extends DataTableColumnKey<R>>(
  columns: Props<R, C>['columns'],
  columnOrder: Props<R, C>['columnOrder']
) {
  return columnOrder.map(columnKey => columns[columnKey]);
}

function makeMesaEventHandlers<R, C extends DataTableColumnKey<R>>(
  setSortUiState: (newSort: DataTableSortObject<R, C>) => void
) {
  return {
    onSort: ({ key }: { key: C }, direction: DataTableSortObject<R, C>['direction']) => {
      setSortUiState({ columnKey: key, direction });
    }
  };
};

function makeMesaUiState<R, C extends DataTableColumnKey<R>>(sort: DataTableSortObject<R, C>) {
  return {
    sort
  };
}

function makeMesaOptions<R>(
  onRowMouseOver?: (row: R) => void,
  onRowMouseOut?: (row: R) => void
) {
  return {
    toolbar: true,
    onRowMouseOver,
    onRowMouseOut
  };
}
