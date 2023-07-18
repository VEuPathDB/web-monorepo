import { useMemo } from 'react';
import { StudyEntity, TabularDataResponse } from '../../core';
import { variableDisplayWithUnit } from '../../core/utils/variable-display';

/**
 * Process and transform a `TableDataResponse` into the format
 * needed for the DataGrid component.
 */
export function useProcessedGridData(
  gridData: TabularDataResponse | null,
  entities: Array<StudyEntity>,
  currentEntity?: StudyEntity
) {
  return useMemo(
    () => processGridData(gridData, entities, currentEntity),
    [gridData, entities, currentEntity]
  );
}

export const processGridData = (
  gridData: TabularDataResponse | null,
  entities: Array<StudyEntity>,
  currentEntity?: StudyEntity
): [
  Array<{
    Header: string;
    accessor: string;
    disableSortBy?: boolean;
  }>,
  Array<{ [key: string]: any }>
] => {
  // If there is no grid data, just return empty values.
  if (!gridData) return [[], []];

  // Step 1: Construct the transformed gridColumns.
  const gridColumns = gridData[0].map((columnID) => {
    /**
     * While we have the raw data for the columns, we need to determine
     * the appropriate display name for each column. This is more complicated
     * than it sounds as we have to check different places depending on
     * whether the column represents an entity or a variable.
     */

    // Search for it as an entity.
    const entity = entities.find((entity) => entity.idColumnName === columnID);

    // Search for it as a variable.
    const variable = currentEntity?.variables.find(
      (variable) => variable.id === columnID
    );

    if (variable) {
      return {
        Header: variableDisplayWithUnit(variable) ?? variable.displayName,
        accessor: `${currentEntity?.id}/${variable.id}`,
      };
    } else if (entity) {
      return {
        Header: `${entity.displayName} ID`,
        accessor: `${entity.id}/${columnID}`,
        disableSortBy: true,
      };
    } else {
      throw Error(
        `A valid entity or variable definition could not be found for this column: ${columnID}`
      );
    }
  });

  // Step 2: Construct the transformed gridRows.
  const gridRows = gridData.slice(1).map((row) => {
    return row.reduce((previousValue, currentValue, index) => {
      return {
        ...previousValue,
        [gridColumns[index].accessor]: currentValue,
      };
    }, {});
  });
  return [gridColumns, gridRows];
};
