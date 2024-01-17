import { fail, badType, missingFromState } from './Errors';
import { repositionItemInList } from './Utils';

/*    Basic Setters   */
export const setRows = (state, rows, resetFilteredRows = true) => {
  if (!Array.isArray(rows))
    return badType('setRows', 'rows', 'array', typeof rows) || state;
  let filteredRows = [...rows];
  let replacements = Object.assign(
    {},
    { rows },
    resetFilteredRows ? { filteredRows } : {}
  );
  return Object.assign({}, state, replacements);
};

export const setFilteredRows = (state, filteredRows) => {
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
};

export const filterRows = (state, predicate) => {
  if (typeof predicate !== 'function')
    return (
      badType('filterRows', 'predicate', 'function', typeof predicate) || state
    );
  if (!Array.isArray(state.rows))
    return missingFromState('filterRows', 'rows', state) || state;
  const filteredRows = state.rows.filter(predicate);
  return setFilteredRows(state, filteredRows);
};

export const setColumns = (state, columns) => {
  if (!Array.isArray(columns))
    return badType('setColumns', 'columns', 'array', typeof columns) || state;
  const keys = columns.map((col) => col.key);
  const initialUiState = state.uiState ? state.uiState : {};
  let columnOrder = initialUiState.columnOrder
    ? initialUiState.columnOrder
    : [];
  keys.forEach((key) => {
    if (!columnOrder.includes(key)) columnOrder = [...columnOrder, key];
  });
  columnOrder = columnOrder.filter((key) => keys.includes(key));
  const uiState = Object.assign({}, initialUiState, { columnOrder });
  return Object.assign({}, state, { columns, uiState });
};

export const setColumnOrder = (state, columnOrder) => {
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

export const setActions = (state, actions) => {
  if (!Array.isArray(actions))
    return badType('setActions', 'actions', 'array', typeof actions) || state;
  return Object.assign({}, state, { actions });
};

export const setUiState = (state, uiState) => {
  if (typeof uiState !== 'object')
    return badType('setUiState', 'uiState', 'object', typeof uiState) || state;
  return Object.assign({}, state, { uiState });
};

export const setOptions = (state, options) => {
  if (typeof options !== 'object')
    return badType('setOptions', 'options', 'object', typeof options) || state;
  return Object.assign({}, state, { options });
};

export const setHeaderWrapperStyle = (state, headerWrapperStyle) => {
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

export const setEventHandlers = (state, eventHandlers) => {
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

export const getSelectedRows = (state, onlyFilteredRows = true) => {
  if (onlyFilteredRows && !('filteredRows' in state))
    return missingFromState('getSelectedRows', 'filteredRows', state) || state;
  const { filteredRows } = state;
  if (onlyFilteredRows && !Array.isArray(filteredRows))
    return (
      badType(
        'getSelectedRows',
        'filteredRows',
        'array',
        typeof filteredRows
      ) || state
    );

  if (!onlyFilteredRows && !('rows' in state))
    return missingFromState('getSelectedRows', 'filteredRows', state) || state;
  const { rows } = state;
  if (!onlyFilteredRows && !Array.isArray(rows))
    return badType('getSelectedRows', 'rows', 'array', typeof rows) || state;

  if (!('options' in state))
    return missingFromState('getSelectedRows', 'options', state) || state;
  if (typeof state.options !== 'object')
    return (
      badType('getSelectedRows', 'options', 'object', typeof options) || state
    );
  const { options } = state;

  if (!('isRowSelected' in options))
    return (
      missingFromState('getSelectedRows', 'options.isRowSelected', options) ||
      state
    );
  const { isRowSelected } = state;
  if (typeof isRowSelected !== 'function')
    return (
      badType(
        'getSelectedRows',
        'options.isRowSelected',
        'function',
        typeof isRowSelected
      ) || state
    );

  return (onlyFilteredRows ? filteredRows : rows).filter(isRowSelected);
};

export const getRows = (state) => {
  const { rows } = state;
  if (!Array.isArray(rows)) {
    badType('getRows', 'rows', 'array', typeof rows);
    return [];
  }
  return rows;
};

export const getFilteredRows = (state) => {
  const { filteredRows } = state;
  if (!Array.isArray(filteredRows)) {
    badType('getFilteredRows', 'filteredRows', 'array', typeof filteredRows);
    return [];
  }
  return filteredRows;
};

export const getColumns = (state) => {
  const { columns } = state;
  if (!Array.isArray(columns)) {
    badType('getColumns', 'columns', 'array', typeof columns);
    return [];
  }
  return columns;
};

export const getActions = (state) => {
  const { actions } = state;
  if (!Array.isArray(actions)) {
    badType('getActions', 'actions', 'array', typeof actions);
    return [];
  }
  return actions;
};

export const getOptions = (state) => {
  const { options } = state;
  if (typeof options !== 'object') {
    badType('getOptions', 'options', 'object', typeof options);
    return {};
  }
  return options;
};

export const getEventHandlers = (state) => {
  const { eventHandlers } = state;
  if (typeof eventHandlers !== 'object') {
    badType(
      'getEventHandlers',
      'eventHandlers',
      'object',
      typeof eventHandlers
    );
    return [];
  }
  return eventHandlers;
};

export const getUiState = (state) => {
  const { uiState } = state;
  if (typeof uiState !== 'object') {
    badType('getUiState', 'uiState', 'object', typeof uiState);
    return {};
  }
  return uiState;
};

/*    Generic state "create" function   */

/**
 * @param {any} options
 * @param {any=} state
 */
export const create = (
  {
    rows,
    filteredRows,
    columns,
    options,
    actions,
    eventHandlers,
    uiState,
    headerWrapperStyle,
  },
  state = {}
) => {
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
  return state;
};

/*    Deeper, more specific setters   */

export const setSelectionPredicate = (state, predicate) => {
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

export const setSearchQuery = (state, searchQuery) => {
  if (typeof searchQuery !== 'string' && searchQuery !== null)
    return (
      badType('setSearchQuery', 'searchQuery', 'string', typeof searchQuery) ||
      state
    );

  const uiState = Object.assign({}, state.uiState ? state.uiState : {}, {
    searchQuery,
  });
  return Object.assign({}, state, { uiState });
};

export const setEmptinessCulprit = (state, emptinessCulprit) => {
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

export const setSortColumnKey = (state, columnKey) => {
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
};

export const setSortDirection = (state, direction) => {
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
};

export const moveColumnToIndex = (state, columnKey, toIndex) => {
  if (typeof columnKey !== 'string')
    return badType(
      'changeColumnIndex',
      '"columnKey" should be a string.',
      TypeError
    );
  if (typeof toIndex !== 'number')
    return badType(
      'changeColumnIndex',
      '"toIndex" should be a number"',
      TypeError
    );
  if (!('columns' in state))
    return missingFromState('changeColumnIndex', 'columns', state) || state;

  const oldColumns = getColumns(state);
  const fromIndex = oldColumns.findIndex(({ key }) => columnKey === key);
  if (fromIndex < 0)
    return (
      fail('changeColumnIndex', `column with key "${columnKey}" not found.`) ||
      state
    );
  const columns = repositionItemInList(oldColumns, fromIndex, toIndex);
  return Object.assign({}, state, { columns });
};

export const callActionOnSelectedRows = (
  state,
  action,
  batch = false,
  onlyFilteredRows = true
) => {
  if (!('selectedRows' in state))
    return (
      missingFromState('callActionOnSelectedRows', 'selectedRows', state) ||
      state
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
  if (batch) action(selectedRows);
  else selectedRows.forEach(action);
  return state;
};
