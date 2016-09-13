export const TABLE_STATE_UPDATED = 'eupathdb-record-view/table-state-updated';

export const updateTableState = (tableName, tableState) => ({
  type: TABLE_STATE_UPDATED,
  payload: { tableName, tableState }
});
