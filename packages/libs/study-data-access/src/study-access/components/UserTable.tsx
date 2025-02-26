import React, { useMemo, useState } from 'react';

import { orderBy } from 'lodash';

import { RealTimeSearchBox } from '@veupathdb/wdk-client/lib/Components';
import Mesa, { MesaState } from '@veupathdb/coreui/lib/components/Mesa';
import {
  MesaColumn,
  MesaSortObject,
} from '@veupathdb/coreui/lib/components/Mesa/types';
import { Seq } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import {
  areTermsInString,
  parseSearchQueryString,
} from '@veupathdb/wdk-client/lib/Utils/SearchUtils';

import { cx } from './StudyAccess';

export interface Props<R, C extends UserTableColumnKey<R>> {
  rows: R[];
  columns: UserTableColumns<R, C>;
  columnOrder: readonly C[];
  idGetter: (row: R) => number | string;
  initialSort?: UserTableSortObject<R, C>;
  actions?: {
    element: React.ReactNode | ((selection: R[]) => React.ReactNode);
    callback: (selection: R[]) => void;
  }[];
}

export type UserTableColumnKey<R> = keyof R & string;

export interface UserTableSortObject<R, K extends UserTableColumnKey<R>>
  extends MesaSortObject {
  columnKey: K;
  direction: 'asc' | 'desc';
}

type OrderablePrimimitive = boolean | number | string;

export interface UserTableColumn<R, K extends UserTableColumnKey<R>>
  extends MesaColumn<R, K> {
  makeSearchableString?: (value: R[K], row: R) => string;
  makeOrder?: (row: R) => OrderablePrimimitive | OrderablePrimimitive[];
}

export type UserTableColumns<R, C extends UserTableColumnKey<R>> = {
  [K in C]: UserTableColumn<R, K>;
};

export function UserTable<R, C extends UserTableColumnKey<R>>({
  actions,
  columnOrder,
  columns,
  rows,
  idGetter,
  initialSort,
}: Props<R, C>) {
  const [selectedRowIds, setSelectedRowIds] = useState(
    () => new Set<number | string>()
  );

  const [searchTerm, setSearchTerm] = useState('');

  const initialSortUiState: UserTableSortObject<R, C> = initialSort ?? {
    columnKey: columns[columnOrder[0]].key,
    direction: 'asc',
  };
  const [sortUiState, setSortUiState] = useState(initialSortUiState);

  const mesaRows = useMemo(
    () => makeMesaRows(rows, columns, sortUiState),
    [rows, columns, sortUiState]
  );

  const mesaFilteredRows = useMesaFilteredRows(
    mesaRows,
    columns,
    columnOrder,
    searchTerm
  );

  const mesaColumns = useMemo(
    () => makeMesaColumns(columns, columnOrder),
    [columns, columnOrder]
  );

  const mesaOptions = useMemo(
    () => makeMesaOptions(selectedRowIds, idGetter, actions),
    [selectedRowIds, idGetter, actions]
  );
  const mesaEventHandlers = useMemo(
    () =>
      makeMesaEventHandlers(
        setSortUiState,
        selectedRowIds,
        setSelectedRowIds,
        idGetter,
        actions
      ),
    [selectedRowIds, idGetter, actions]
  );
  const mesaUiState = useMemo(
    () => makeMesaUiState(sortUiState),
    [sortUiState]
  );

  const mesaState = useMemo(
    () =>
      MesaState.create({
        rows: mesaRows,
        filteredRows: mesaFilteredRows,
        columns: mesaColumns,
        actions,
        options: mesaOptions,
        eventHandlers: mesaEventHandlers,
        uiState: mesaUiState,
      }),
    [
      actions,
      mesaRows,
      mesaFilteredRows,
      mesaColumns,
      mesaOptions,
      mesaEventHandlers,
      mesaUiState,
    ]
  );

  return (
    <div className={cx('--UserTable')}>
      <Mesa state={mesaState}>
        <div className={cx('--SearchBoxContainer')}>
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

function makeMesaRows<R, C extends UserTableColumnKey<R>>(
  rows: Props<R, C>['rows'],
  columns: Props<R, C>['columns'],
  sortUiState: UserTableSortObject<R, C>
) {
  const { columnKey: sortKey, direction: sortDirection } = sortUiState;

  const makeOrder = columns[sortKey].makeOrder;

  return makeOrder == null
    ? orderBy(rows, sortKey, sortDirection)
    : orderBy(rows, makeOrder, sortDirection);
}

function useMesaFilteredRows<R, C extends UserTableColumnKey<R>>(
  rows: Props<R, C>['rows'],
  columns: Props<R, C>['columns'],
  columnOrder: Props<R, C>['columnOrder'],
  searchTerm: string
) {
  const searchTerms = useMemo(
    () => parseSearchQueryString(searchTerm),
    [searchTerm]
  );

  const rowsWithSearchableString = useMemo(
    () =>
      Seq.from(rows).map((row) => {
        const searchableColumnStrings = columnOrder.map((columnKey) => {
          const { makeSearchableString } = columns[columnKey];

          return makeSearchableString == null
            ? String(row[columnKey])
            : makeSearchableString(row[columnKey], row);
        });

        const searchableRowString = searchableColumnStrings.join('\0');

        return {
          row,
          searchableRowString,
        };
      }),
    [rows, columns, columnOrder]
  );

  return useMemo(
    () =>
      rowsWithSearchableString
        .filter(({ searchableRowString }) =>
          areTermsInString(searchTerms, searchableRowString)
        )
        .map(({ row }) => row)
        .toArray(),
    [rowsWithSearchableString, searchTerms]
  );
}

function makeMesaColumns<R, C extends UserTableColumnKey<R>>(
  columns: Props<R, C>['columns'],
  columnOrder: Props<R, C>['columnOrder']
) {
  return columnOrder.map((columnKey) => columns[columnKey]);
}

function makeMesaEventHandlers<R, C extends UserTableColumnKey<R>>(
  setSortUiState: (newSort: UserTableSortObject<R, C>) => void,
  selectedRowIds: Set<number | string>,
  setSelectedRowIds: (newSelectedRowIds: Set<number | string>) => void,
  idGetter: Props<R, C>['idGetter'],
  actions: Props<R, C>['actions']
) {
  const onMultipleRowSelect =
    actions &&
    ((selectedRows: R[]) => {
      const newSelectedRowIds = new Set(selectedRowIds);

      selectedRows.forEach((selectedRow) => {
        newSelectedRowIds.add(idGetter(selectedRow));
      });

      setSelectedRowIds(newSelectedRowIds);
    });

  const onMultipleRowDeselect =
    actions &&
    ((deselectedRows: R[]) => {
      const newSelectedRowIds = new Set(selectedRowIds);

      deselectedRows.forEach((deselectedRow) => {
        newSelectedRowIds.delete(idGetter(deselectedRow));
      });

      setSelectedRowIds(newSelectedRowIds);
    });

  return {
    onSort: (
      { key }: { key: C },
      direction: UserTableSortObject<R, C>['direction']
    ) => {
      setSortUiState({ columnKey: key, direction });
    },
    onMultipleRowSelect,
    onMultipleRowDeselect,
    onRowSelect:
      onMultipleRowSelect &&
      ((selectedRow: R) => {
        onMultipleRowSelect([selectedRow]);
      }),
    onRowDeselect:
      onMultipleRowDeselect &&
      ((deselectedRow: R) => {
        onMultipleRowDeselect([deselectedRow]);
      }),
  };
}

function makeMesaUiState<R, C extends UserTableColumnKey<R>>(
  sort: UserTableSortObject<R, C>
) {
  return {
    sort,
  };
}

function makeMesaOptions<R, C extends UserTableColumnKey<R>>(
  selectedRowIds: Set<number | string>,
  idGetter: Props<R, C>['idGetter'],
  actions: Props<R, C>['actions']
) {
  return {
    isRowSelected:
      actions &&
      ((row: R) => {
        return selectedRowIds.has(idGetter(row));
      }),
    toolbar: actions == null,
  };
}
