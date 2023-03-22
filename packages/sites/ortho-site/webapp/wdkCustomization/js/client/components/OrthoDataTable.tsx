import React, { useMemo, useState } from 'react';

import { orderBy } from 'lodash';

import { RealTimeSearchBox } from '@veupathdb/wdk-client/lib/Components';
import { Mesa, MesaState } from '@veupathdb/wdk-client/lib/Components/Mesa';
import { Seq } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import {
  areTermsInString,
  parseSearchQueryString
} from '@veupathdb/wdk-client/lib/Utils/SearchUtils';

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
  tableBodyMaxHeight?: string;
}

export function OrthoDataTable<R, C extends DataTableColumnKey<R>>(
  {
    rows,
    columns,
    columnOrder,
    onRowMouseOver,
    onRowMouseOut,
    tableBodyMaxHeight = 'calc(80vh - 275px)'
  }: Props<R, C>
) {
  const [ searchTerm, setSearchTerm ] = useState('');

  const initialSortUiState: DataTableSortObject<R, C> =
    { columnKey: columns[columnOrder[0]].key, direction: 'asc' };
  const [ sortUiState, setSortUiState ] = useState(initialSortUiState);

  const mesaRows = useMemo(
    () => makeMesaRows(rows, columns, sortUiState),
    [ rows, columns, sortUiState ]
  );

  const mesaFilteredRows = useMesaFilteredRows(mesaRows, columns, columnOrder, searchTerm);

  const mesaColumns = useMemo(() => makeMesaColumns(columns, columnOrder), [ columns, columnOrder ]);

  const mesaOptions = useMemo(
    () => makeMesaOptions(onRowMouseOver, onRowMouseOut, tableBodyMaxHeight),
    [ onRowMouseOver, onRowMouseOut, tableBodyMaxHeight ]
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
    <div className="OrthoDataTable">
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

function useMesaFilteredRows<R, C extends DataTableColumnKey<R>>(
  rows: Props<R, C>['rows'],
  columns: Props<R, C>['columns'],
  columnOrder: Props<R, C>['columnOrder'],
  searchTerm: string
) {
  const searchTerms = useMemo(
    () => parseSearchQueryString(searchTerm),
    [ searchTerm ]
  );

  const rowsWithSearchableString = useMemo(
    () => Seq.from(rows).map(row => {
      const searchableColumnStrings = columnOrder.map(columnKey => {
        const { makeSearchableString } = columns[columnKey];

        return makeSearchableString == null
          ? String(row[columnKey])
          : makeSearchableString(row[columnKey]);
      });

      const searchableRowString = searchableColumnStrings.join('\0');

      return {
        row,
        searchableRowString
      };
    }),
    [ rows, columns, columnOrder ]
  );

  return useMemo(
    () => (
      rowsWithSearchableString
        .filter(
          ({ searchableRowString }) => areTermsInString(searchTerms, searchableRowString)
        )
        .map(
          ({ row }) => row
        )
        .toArray()
    ),
    [ rowsWithSearchableString, searchTerms ]
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
  onRowMouseOut?: (row: R) => void,
  tableBodyMaxHeight?: string
) {
  return {
    toolbar: true,
    useStickyHeader: true,
    tableBodyMaxHeight,
    onRowMouseOver,
    onRowMouseOut
  };
}
