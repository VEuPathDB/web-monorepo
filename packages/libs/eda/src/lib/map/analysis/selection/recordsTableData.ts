import { StudyEntity, Variable } from '../../../core/types/study';
import { variableDisplayWithUnit } from '../../../core/utils/variable-display';
import { parseCoordinate } from '../utils/coordinates';

export interface RecordsColumn {
  key: string;
  header: string;
  kind: 'id' | 'variable';
}

export interface RecordsRow {
  key: string;
  values: Record<string, string>;
  /** set when the record has its own lat/long */
  position?: { lat: number; lng: number };
}

/**
 * Turn a `tabular` response ("standard" headers: entity ID column names and
 * variable ids, then one array per record) into display columns and rows.
 * Latitude/longitude columns, when requested, are folded into a `position`
 * rather than shown as plain columns.
 */
export function parseRecords(
  response: string[][],
  entities: StudyEntity[],
  variables: Variable[],
  latLongVariableIds?: { latitude: string; longitude: string }
): { columns: RecordsColumn[]; rows: RecordsRow[] } {
  const [header = [], ...data] = response;
  const latIndex = latLongVariableIds
    ? header.indexOf(latLongVariableIds.latitude)
    : -1;
  const lngIndex = latLongVariableIds
    ? header.indexOf(latLongVariableIds.longitude)
    : -1;

  const columnsByIndex = header.map(
    (columnId, index): RecordsColumn | undefined => {
      if (index === latIndex || index === lngIndex) return undefined;
      const entity = entities.find(
        ({ idColumnName }) => idColumnName === columnId
      );
      if (entity)
        return {
          key: columnId,
          header: `${entity.displayName} ID`,
          kind: 'id',
        };
      const variable = variables.find(({ id }) => id === columnId);
      return {
        key: columnId,
        header: variableDisplayWithUnit(variable) ?? columnId,
        kind: 'variable',
      };
    }
  );

  const columns = columnsByIndex.filter(
    (column): column is RecordsColumn => column != null
  );

  // the record's own ID column comes last among the ID columns
  const idIndices = columnsByIndex
    .map((column, index) => (column?.kind === 'id' ? index : -1))
    .filter((index) => index >= 0);

  const rows = data.map((cells, rowIndex): RecordsRow => {
    const values: Record<string, string> = {};
    columnsByIndex.forEach((column, index) => {
      if (column) values[column.key] = cells[index] ?? '';
    });
    const lat = latIndex >= 0 ? parseCoordinate(cells[latIndex]) : undefined;
    const lng = lngIndex >= 0 ? parseCoordinate(cells[lngIndex]) : undefined;
    const keyParts = idIndices.map((index) => cells[index]);
    return {
      key: keyParts.length > 0 ? keyParts.join('/') : String(rowIndex),
      values,
      position: lat != null && lng != null ? { lat, lng } : undefined,
    };
  });

  return { columns, rows };
}
