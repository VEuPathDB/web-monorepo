import React, { useMemo, useState } from 'react';

import { orderBy } from 'lodash';

import { Mesa, MesaState } from 'wdk-client/Components/Mesa';

import { GraphInformationColumnKey, GraphInformationColumns, GraphInformationSortObject } from '../../utils/graphInformation';

interface Props<R, C extends GraphInformationColumnKey<R>> {
  rows: R[];
  columns: GraphInformationColumns<R, C>;
  columnOrder: readonly C[];
}

export function GraphInformationDataTable<R, C extends GraphInformationColumnKey<R>>(
  { rows, columns, columnOrder }: Props<R, C>
) {
  const mesaState = useMesaState(rows, columns, columnOrder);

  return (
    <div className="GraphInformationDataTable">
      <Mesa state={mesaState} />
    </div>
  );
}

function useMesaState<R, C extends GraphInformationColumnKey<R>>(
  rows: Props<R, C>['rows'],
  columns: Props<R, C>['columns'],
  columnOrder: Props<R, C>['columnOrder']
) {
  const initialSortUiState: GraphInformationSortObject<R, C> =
    { columnKey: columns[columnOrder[0]].key, direction: 'asc' };
  const [ sortUiState, setSortUiState ] = useState(initialSortUiState);

  const mesaRows = useMemo(() => makeMesaRows(rows, columns, sortUiState), [ rows, columns, sortUiState ]);
  const mesaColumns = useMemo(() => makeMesaColumns(columns, columnOrder), [ columns, columnOrder ]);

  const mesaEventHandlers = useMemo(() => makeMesaEventHandlers(setSortUiState), []);
  const mesaUiState = useMemo(() => makeMesaUiState(sortUiState), [ sortUiState ]);

  return useMemo(
    () => MesaState.create({
      rows: mesaRows,
      columns: mesaColumns,
      eventHandlers: mesaEventHandlers,
      uiState: mesaUiState
    }),
    [ mesaRows, mesaColumns, mesaEventHandlers, mesaUiState ]
  );
}

function makeMesaRows<R, C extends GraphInformationColumnKey<R>>(
  rows: Props<R, C>['rows'],
  columns: Props<R, C>['columns'],
  sortUiState: GraphInformationSortObject<R, C>
) {
  const { columnKey: sortKey, direction: sortDirection } = sortUiState;

  const makeOrder = columns[sortKey].makeOrder;

  return makeOrder == null
    ? orderBy(rows, sortKey, sortDirection)
    : orderBy(rows, makeOrder, sortDirection);
}

function makeMesaColumns<R, C extends GraphInformationColumnKey<R>>(
  columns: Props<R, C>['columns'],
  columnOrder: Props<R, C>['columnOrder']
) {
  return columnOrder.map(columnKey => columns[columnKey]);
}

function makeMesaEventHandlers<R, C extends GraphInformationColumnKey<R>>(
  setSortUiState: (newSort: GraphInformationSortObject<R, C>) => void
) {
  return {
    onSort: ({ key }: { key: C }, direction: GraphInformationSortObject<R, C>['direction']) => {
      setSortUiState({ columnKey: key, direction });
    }
  };
};

function makeMesaUiState<R, C extends GraphInformationColumnKey<R>>(sort: GraphInformationSortObject<R, C>) {
  return {
    sort
  };
}
