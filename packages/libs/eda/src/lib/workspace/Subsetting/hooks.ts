import { useMemo } from 'react';
import { Field } from '@veupathdb/wdk-client/lib/Components/AttributeFilter/Types';

import { StudyEntity, TableDataResponse } from '../../core';

/**
 * Process and transform a `TableDataResponse` into the format
 * needed for the DataGrid component.
 */
export function useProcessedGridData(
  gridData: TableDataResponse | null,
  flattenedFields: Array<Field>,
  entities: Array<StudyEntity>
): [
  Array<{
    Header: string;
    accessor: string;
  }>,
  Array<{ [key: string]: any }>
] {
  return useMemo(() => {
    // If there is no grid data, just return empty values.
    if (!gridData) return [[], []];

    // Step 1: Construct the transformed gridColumns.
    const gridColumns = gridData.columns.map((column) => {
      /**
       * While we have the raw data for the columns, we need to determine
       * the appropriate display name for each column. This is more complicated
       * than it sounds as we have to check different places depending on
       * whether the column represents an entity or a variable.
       */

      // Search for it as a variable.
      const variable = flattenedFields.find(
        (field) => field.term === `${column.entityId}/${column.variableId}`
      );

      // Search for it as a variable.
      const entity = entities.find(
        (entity) =>
          entity.id === column.entityId &&
          entity.idColumnName === column.variableId
      );

      if (variable) {
        return {
          Header: variable.display,
          accessor: variable.term,
        };
      } else if (entity) {
        return {
          Header: entity.displayName,
          accessor: `${column.entityId}/${column.variableId}`,
        };
      } else {
        throw Error(
          `A valid entity or variable definition could not be found for this column: ${column.entityId}/${column.variableId}`
        );
      }
    });

    // Step 2: Construct the transformed gridRows.
    const gridRows = gridData.rows.map((row) => {
      return row.reduce((previousValue, currentValue, index) => {
        return {
          ...previousValue,
          [gridColumns[index].accessor]: currentValue,
        };
      }, {});
    });
    return [gridColumns, gridRows];
  }, [gridData, flattenedFields, entities]);
}
