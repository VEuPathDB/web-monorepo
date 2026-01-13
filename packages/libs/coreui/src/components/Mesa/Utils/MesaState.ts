import { fail, badType, missingFromState } from './Errors';
import { repositionItemInList } from './Utils';
import type { MesaStateProps, MesaColumn } from '../types';
import { CSSProperties } from 'react';

/*
 * NOTE: This file contains extensive runtime type checking (badType, missingFromState, etc.)
 * that may seem redundant with TypeScript's compile-time checks. This is legacy defensive
 * code from the original JavaScript implementation. While TypeScript now provides type safety
 * at compile time, these runtime checks remain as defense against:
 * - Type assertions/casts that bypass compile-time checks
 * - External consumers using 'any' types
 * - Debugging issues in production
 *
 * In a greenfield TypeScript project, most of these checks would be unnecessary.
 */

/*    Basic Setters   */
// Overload: Full state in -> full state out
export function setRows<
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: MesaStateProps<Row, Key>,
  rows: Row[],
  resetFilteredRows?: boolean
): MesaStateProps<Row, Key>;

// Overload: Partial state in -> partial state out
export function setRows<
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  rows: Row[],
  resetFilteredRows?: boolean
): Partial<MesaStateProps<Row, Key>>;

// Implementation
export function setRows<
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  rows: Row[],
  resetFilteredRows = true
): Partial<MesaStateProps<Row, Key>> {
  if (!Array.isArray(rows))
    return badType('setRows', 'rows', 'array', typeof rows) || state;
  const filteredRows = [...rows];
  const replacements = Object.assign(
    {},
    { rows },
    resetFilteredRows ? { filteredRows } : {}
  );
  return Object.assign({}, state, replacements);
}

// Overload: Full state in -> full state out
export function setFilteredRows<
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: MesaStateProps<Row, Key>,
  filteredRows: Row[]
): MesaStateProps<Row, Key>;

// Overload: Partial state in -> partial state out
export function setFilteredRows<
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  filteredRows: Row[]
): Partial<MesaStateProps<Row, Key>>;

// Implementation
export function setFilteredRows<
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  filteredRows: Row[]
): Partial<MesaStateProps<Row, Key>> {
  if (!Array.isArray(filteredRows))
    return (
      badType(
        'setFilteredRows',
        'filteredRows',
        'array',
        typeof filteredRows
      ) || state
    );
  return Object.assign({}, state, { filteredRows });
}

// Overload: Full state in -> full state out
export function filterRows<
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: MesaStateProps<Row, Key>,
  predicate: (row: Row) => boolean
): MesaStateProps<Row, Key>;

// Overload: Partial state in -> partial state out
export function filterRows<
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  predicate: (row: Row) => boolean
): Partial<MesaStateProps<Row, Key>>;

// Implementation
export function filterRows<
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  predicate: (row: Row) => boolean
): Partial<MesaStateProps<Row, Key>> {
  if (typeof predicate !== 'function')
    return (
      badType('filterRows', 'predicate', 'function', typeof predicate) || state
    );
  if (!Array.isArray(state.rows))
    return missingFromState('filterRows', 'rows', state as object) || state;
  const filteredRows = state.rows.filter(predicate);
  return setFilteredRows(state, filteredRows);
}

// Overload: Full state in -> full state out
export function setColumns<
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: MesaStateProps<Row, Key>,
  columns: MesaColumn<Row, Key>[]
): MesaStateProps<Row, Key>;

// Overload: Partial state in -> partial state out
export function setColumns<
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  columns: MesaColumn<Row, Key>[]
): Partial<MesaStateProps<Row, Key>>;

// Implementation
export function setColumns<
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  columns: MesaColumn<Row, Key>[]
): Partial<MesaStateProps<Row, Key>> {
  if (!Array.isArray(columns))
    return badType('setColumns', 'columns', 'array', typeof columns) || state;
  const keys = columns.map((col) => col.key);
  const initialUiState = state.uiState ? state.uiState : {};
  let columnOrder = initialUiState.columnOrder
    ? initialUiState.columnOrder
    : [];
  keys.forEach((key) => {
    if (!columnOrder!.includes(key as string))
      columnOrder = [...columnOrder!, key as string];
  });
  columnOrder = columnOrder!.filter((keyStr) => keys.includes(keyStr as Key));
  const uiState = Object.assign({}, initialUiState, { columnOrder });
  return Object.assign({}, state, { columns, uiState });
}

export const setColumnOrder = <
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  columnOrder: string[]
): Partial<MesaStateProps<Row, Key>> | undefined => {
  if (!Array.isArray(columnOrder))
    return badType(
      'setColumnOrder',
      'columnOrder',
      'array',
      typeof columnOrder
    );
  const initialUiState = state.uiState ? state.uiState : {};
  const uiState = Object.assign({}, initialUiState, { columnOrder });
  return Object.assign({}, state, { uiState });
};

export const setActions = <
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  actions: NonNullable<MesaStateProps<Row, Key>['actions']>
): Partial<MesaStateProps<Row, Key>> => {
  if (!Array.isArray(actions))
    return badType('setActions', 'actions', 'array', typeof actions) || state;
  return Object.assign({}, state, { actions });
};

// Overload: Full state in -> full state out
export function setUiState<
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: MesaStateProps<Row, Key>,
  uiState: NonNullable<MesaStateProps<Row, Key>['uiState']>
): MesaStateProps<Row, Key>;

// Overload: Partial state in -> partial state out
export function setUiState<
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  uiState: NonNullable<MesaStateProps<Row, Key>['uiState']>
): Partial<MesaStateProps<Row, Key>>;

// Implementation
export function setUiState<
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  uiState: NonNullable<MesaStateProps<Row, Key>['uiState']>
): Partial<MesaStateProps<Row, Key>> {
  if (typeof uiState !== 'object')
    return badType('setUiState', 'uiState', 'object', typeof uiState) || state;
  return Object.assign({}, state, { uiState });
}

export const setOptions = <
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  options: NonNullable<MesaStateProps<Row, Key>['options']>
): Partial<MesaStateProps<Row, Key>> => {
  if (typeof options !== 'object')
    return badType('setOptions', 'options', 'object', typeof options) || state;
  return Object.assign({}, state, { options });
};

export const setHeaderWrapperStyle = <
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  headerWrapperStyle: CSSProperties
): Partial<MesaStateProps<Row, Key>> => {
  if (typeof headerWrapperStyle !== 'object')
    return (
      badType(
        'setHeaderWrapperStyle',
        'headerWrapperStyle',
        'object',
        typeof headerWrapperStyle
      ) || state
    );
  return Object.assign({}, state, { headerWrapperStyle });
};

export const setEventHandlers = <
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  eventHandlers: NonNullable<MesaStateProps<Row, Key>['eventHandlers']>
): Partial<MesaStateProps<Row, Key>> => {
  if (typeof eventHandlers !== 'object')
    return (
      badType(
        'setEventHandlers',
        'eventHandlers',
        'object',
        typeof eventHandlers
      ) || state
    );
  return Object.assign({}, state, { eventHandlers });
};

export const getSelectedRows = <
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  onlyFilteredRows = true
): Row[] => {
  if (onlyFilteredRows && !('filteredRows' in state)) {
    missingFromState('getSelectedRows', 'filteredRows', state as object);
    return [];
  }
  const { filteredRows } = state;
  if (onlyFilteredRows && !Array.isArray(filteredRows)) {
    badType('getSelectedRows', 'filteredRows', 'array', typeof filteredRows);
    return [];
  }

  if (!onlyFilteredRows && !('rows' in state)) {
    missingFromState('getSelectedRows', 'rows', state as object);
    return [];
  }
  const { rows } = state;
  if (!onlyFilteredRows && !Array.isArray(rows)) {
    badType('getSelectedRows', 'rows', 'array', typeof rows);
    return [];
  }

  if (!('options' in state)) {
    missingFromState('getSelectedRows', 'options', state as object);
    return [];
  }
  if (typeof state.options !== 'object') {
    badType('getSelectedRows', 'options', 'object', typeof state.options);
    return [];
  }
  const { options } = state;

  if (!options || !('isRowSelected' in options)) {
    missingFromState(
      'getSelectedRows',
      'options.isRowSelected',
      (options as object) || {}
    );
    return [];
  }
  const { isRowSelected } = options;
  if (typeof isRowSelected !== 'function') {
    badType(
      'getSelectedRows',
      'options.isRowSelected',
      'function',
      typeof isRowSelected
    );
    return [];
  }

  return (onlyFilteredRows ? filteredRows : rows)!.filter(isRowSelected);
};

export const getRows = <Row extends Record<PropertyKey, any>>(
  state: Partial<MesaStateProps<Row>>
): Row[] => {
  const { rows } = state;
  if (!Array.isArray(rows)) {
    badType('getRows', 'rows', 'array', typeof rows);
    return [];
  }
  return rows;
};

export const getFilteredRows = <Row extends Record<PropertyKey, any>>(
  state: Partial<MesaStateProps<Row>>
): Row[] => {
  const { filteredRows } = state;
  if (!Array.isArray(filteredRows)) {
    badType('getFilteredRows', 'filteredRows', 'array', typeof filteredRows);
    return [];
  }
  return filteredRows;
};

export const getColumns = <
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>
): MesaColumn<Row, Key>[] => {
  const { columns } = state;
  if (!Array.isArray(columns)) {
    badType('getColumns', 'columns', 'array', typeof columns);
    return [];
  }
  return columns;
};

export const getActions = <
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>
): NonNullable<MesaStateProps<Row, Key>['actions']> => {
  const { actions } = state;
  if (!Array.isArray(actions)) {
    badType('getActions', 'actions', 'array', typeof actions);
    return [];
  }
  return actions;
};

export const getOptions = <
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>
): NonNullable<MesaStateProps<Row, Key>['options']> => {
  const { options } = state;
  if (typeof options !== 'object') {
    badType('getOptions', 'options', 'object', typeof options);
    return {};
  }
  return options;
};

export const getEventHandlers = <
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>
): NonNullable<MesaStateProps<Row, Key>['eventHandlers']> => {
  const { eventHandlers } = state;
  if (typeof eventHandlers !== 'object') {
    badType(
      'getEventHandlers',
      'eventHandlers',
      'object',
      typeof eventHandlers
    );
    return {};
  }
  return eventHandlers;
};

export const getUiState = <
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>
): NonNullable<MesaStateProps<Row, Key>['uiState']> => {
  const { uiState } = state;
  if (typeof uiState !== 'object') {
    badType('getUiState', 'uiState', 'object', typeof uiState);
    return {};
  }
  return uiState;
};

/*    Generic state "create" function   */

/**
 * Creates a Mesa state object from the provided options
 */
export const create = <
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  {
    rows,
    filteredRows,
    columns,
    options,
    actions,
    eventHandlers,
    uiState,
    headerWrapperStyle,
  }: {
    rows?: Row[];
    filteredRows?: Row[];
    columns?: MesaColumn<Row, Key>[];
    options?: NonNullable<MesaStateProps<Row, Key>['options']>;
    actions?: NonNullable<MesaStateProps<Row, Key>['actions']>;
    eventHandlers?: NonNullable<MesaStateProps<Row, Key>['eventHandlers']>;
    uiState?: NonNullable<MesaStateProps<Row, Key>['uiState']>;
    headerWrapperStyle?: CSSProperties;
  },
  state: Partial<MesaStateProps<Row, Key>> = {}
): MesaStateProps<Row, Key> => {
  state = setRows(state, rows ? rows : []);
  state = setColumns(state, columns ? columns : []);
  state = setOptions(state, options ? options : {});
  state = setActions(state, actions ? actions : []);
  state = setUiState(state, uiState ? uiState : {});
  state = setEventHandlers(state, eventHandlers ? eventHandlers : {});
  state = setFilteredRows(
    state,
    filteredRows ? filteredRows : rows ? rows : []
  );
  state = setHeaderWrapperStyle(
    state,
    headerWrapperStyle ? headerWrapperStyle : {}
  );
  return state as MesaStateProps<Row, Key>;
};

/*    Deeper, more specific setters   */

export const setSelectionPredicate = <
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  predicate: (row: Row) => boolean
): Partial<MesaStateProps<Row, Key>> => {
  if (typeof predicate !== 'function')
    return (
      badType(
        'setSelectionPredicate',
        'predicate',
        'function',
        typeof predicate
      ) || state
    );
  const options = Object.assign({}, state.options ? state.options : {}, {
    isRowSelected: predicate,
  });
  return Object.assign({}, state, { options });
};

// Overload: Full state in -> full state out
export function setSearchQuery<
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: MesaStateProps<Row, Key>,
  searchQuery: string | null
): MesaStateProps<Row, Key>;

// Overload: Partial state in -> partial state out
export function setSearchQuery<
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  searchQuery: string | null
): Partial<MesaStateProps<Row, Key>>;

// Implementation
export function setSearchQuery<
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  searchQuery: string | null
): Partial<MesaStateProps<Row, Key>> {
  if (typeof searchQuery !== 'string' && searchQuery !== null)
    return (
      badType('setSearchQuery', 'searchQuery', 'string', typeof searchQuery) ||
      state
    );

  const uiState = Object.assign({}, state.uiState ? state.uiState : {}, {
    searchQuery,
  });
  return Object.assign({}, state, { uiState });
}

export const setEmptinessCulprit = <
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  emptinessCulprit:
    | NonNullable<MesaStateProps<Row, Key>['uiState']>['emptinessCulprit']
    | null
): Partial<MesaStateProps<Row, Key>> => {
  if (typeof emptinessCulprit !== 'string' && emptinessCulprit !== null)
    return (
      badType(
        'setEmptinessCulprit',
        'emptinessCulprit',
        'string',
        typeof emptinessCulprit
      ) || state
    );

  const uiState = Object.assign({}, state.uiState ? state.uiState : {}, {
    emptinessCulprit,
  });
  return Object.assign({}, state, { uiState });
};

// Overload: Full state in -> full state out
export function setSortColumnKey<
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(state: MesaStateProps<Row, Key>, columnKey: string): MesaStateProps<Row, Key>;

// Overload: Partial state in -> partial state out
export function setSortColumnKey<
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  columnKey: string
): Partial<MesaStateProps<Row, Key>>;

// Implementation
export function setSortColumnKey<
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  columnKey: string
): Partial<MesaStateProps<Row, Key>> {
  if (typeof columnKey !== 'string')
    return (
      badType('setSortColumnKey', 'columnKey', 'string', typeof columnKey) ||
      state
    );

  const currentUiState = Object.assign({}, state.uiState ? state.uiState : {});
  const sort = Object.assign(
    {},
    currentUiState.sort ? currentUiState.sort : {},
    { columnKey }
  );
  const uiState = Object.assign({}, currentUiState, { sort });
  return Object.assign({}, state, { uiState });
}

// Overload: Full state in -> full state out
export function setSortDirection<
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: MesaStateProps<Row, Key>,
  direction: 'asc' | 'desc'
): MesaStateProps<Row, Key>;

// Overload: Partial state in -> partial state out
export function setSortDirection<
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  direction: 'asc' | 'desc'
): Partial<MesaStateProps<Row, Key>>;

// Implementation
export function setSortDirection<
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  direction: 'asc' | 'desc'
): Partial<MesaStateProps<Row, Key>> {
  if (typeof direction !== 'string')
    return (
      badType('setSortDirection', 'direction', 'string', typeof direction) ||
      state
    );
  if (!['asc', 'desc'].includes(direction))
    return (
      fail(
        'setSortDirection',
        '"direction" must be either "asc" or "desc"',
        SyntaxError
      ) || state
    );

  const currentUiState = Object.assign({}, state.uiState ? state.uiState : {});
  const sort = Object.assign(
    {},
    currentUiState.sort ? currentUiState.sort : {},
    { direction }
  );
  const uiState = Object.assign({}, currentUiState, { sort });
  return Object.assign({}, state, { uiState });
}

export const moveColumnToIndex = <
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  columnKey: Key,
  toIndex: number
): Partial<MesaStateProps<Row, Key>> | undefined => {
  if (typeof columnKey !== 'string')
    return (
      fail('changeColumnIndex', '"columnKey" should be a string.', TypeError) ||
      state
    );
  if (typeof toIndex !== 'number')
    return (
      fail('changeColumnIndex', '"toIndex" should be a number"', TypeError) ||
      state
    );
  if (!('columns' in state))
    return (
      missingFromState('changeColumnIndex', 'columns', state as object) || state
    );

  const oldColumns = getColumns(state);
  const fromIndex = oldColumns.findIndex(({ key }) => columnKey === key);
  if (fromIndex < 0)
    return (
      fail(
        'changeColumnIndex',
        `column with key "${String(columnKey)}" not found.`
      ) || state
    );
  const columns = repositionItemInList(oldColumns, fromIndex, toIndex);
  return Object.assign({}, state, { columns });
};

export const callActionOnSelectedRows = <
  Row extends Record<PropertyKey, any>,
  Key extends string = string
>(
  state: Partial<MesaStateProps<Row, Key>>,
  action: (row: Row) => void,
  batch = false,
  onlyFilteredRows = true
): Partial<MesaStateProps<Row, Key>> => {
  if (!('selectedRows' in state))
    return (
      missingFromState(
        'callActionOnSelectedRows',
        'selectedRows',
        state as object
      ) || state
    );
  if (typeof action !== 'function')
    return (
      badType(
        'callActionOnSelectedRows',
        'action',
        'function',
        typeof action
      ) || state
    );

  const selectedRows = getSelectedRows(state, onlyFilteredRows);
  if (batch) action(selectedRows as never);
  else selectedRows.forEach(action);
  return state;
};
