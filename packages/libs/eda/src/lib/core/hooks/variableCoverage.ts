import { useMemo } from 'react';

import { keyBy, mapValues } from 'lodash';

import { CompleteCasesTable, CompleteCasesTableRow } from '../api/data-api';
import {
  VariableCoverageTableRow,
  VariableSpec,
} from '../components/VariableCoverageTable';
import { Filter } from '../types/filter';

import { useEntityCounts } from './entityCounts';

/**
 * Returns an array of data to be rendered in a VariableCoverageTable
 * @param completeCases
 * @param filteredEntityCounts
 * @param variables
 * @param outputEntityId
 * @returns A VariableCoverageTableRow[]
 */
export function useVariableCoverageTableRows(
  variableSpecs: VariableSpec[],
  filters: Filter[],
  completeCases?: CompleteCasesTable,
  outputEntityId?: string
): VariableCoverageTableRow[] {
  const completeCasesMap = useCompleteCasesMap(completeCases);
  const filteredEntityCountsResult = useEntityCounts(filters);

  return useMemo(
    () =>
      variableSpecs.map((spec) => {
        if (spec.variable == null) {
          return {
            role: spec.role,
            required: spec.required,
          };
        }

        const { entityId, variableId } = spec.variable;

        const variableCompleteCases =
          completeCasesMap[`${entityId}.${variableId}`];

        if (variableCompleteCases == null) {
          return {
            role: spec.role,
            required: spec.required,
            display: spec.display,
          };
        }

        const baseRowWithCounts = {
          role: spec.role,
          required: spec.required,
          display: spec.display,
          completeCount: variableCompleteCases,
        };

        const variableFilteredEntityCount =
          filteredEntityCountsResult.value == null || outputEntityId == null
            ? undefined
            : filteredEntityCountsResult.value[outputEntityId];

        if (variableFilteredEntityCount == null) {
          return baseRowWithCounts;
        }

        const incompleteCount =
          variableFilteredEntityCount - baseRowWithCounts.completeCount;

        return {
          ...baseRowWithCounts,
          incompleteCount,
          completePercent:
            (baseRowWithCounts.completeCount / variableFilteredEntityCount) *
            100,
          incompletePercent:
            (incompleteCount / variableFilteredEntityCount) * 100,
        };
      }),
    [
      completeCasesMap,
      filteredEntityCountsResult.value,
      outputEntityId,
      variableSpecs,
    ]
  );
}

/**
 * Transforms a CompleteCasesTable array into a map
 * @param completeCasesTable
 * @returns A map with key-value pairs of the form {entityId}.{variableId} -> {completeCaseCount}
 */
export function useCompleteCasesMap(
  completeCasesTable: CompleteCasesTable = []
): Record<string, number> {
  return useMemo(() => {
    const nonemptyRows = completeCasesTable.filter(isNonemptyRow);

    // variableDetails.variableId is of the form {entityId}.{variableId}
    const rowsByVariableId = keyBy(
      nonemptyRows,
      ({ variableDetails }) => variableDetails.variableId
    );

    return mapValues(rowsByVariableId, ({ completeCases }) =>
      Array.isArray(completeCases) ? completeCases[0] : completeCases
    );
  }, [completeCasesTable]);
}

function isNonemptyRow(
  completeCasesTableRow: CompleteCasesTableRow
): completeCasesTableRow is Required<CompleteCasesTableRow> {
  return (
    completeCasesTableRow.variableDetails != null ||
    completeCasesTableRow.completeCases != null
  );
}
