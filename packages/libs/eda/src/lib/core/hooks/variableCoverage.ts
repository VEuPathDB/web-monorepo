import { useMemo } from 'react';

import { CompleteCasesTable } from '../api/data-api';
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
 * @returns A VariableCoverageTableRow[]
 */
export function useVariableCoverageTableRows(
  variableSpecs: VariableSpec[],
  filters: Filter[],
  completeCases?: CompleteCasesTable
): VariableCoverageTableRow[] {
  const completeCasesMap = useCompleteCasesMap(completeCases);
  const filteredEntityCountsResult = useEntityCounts(filters);

  return useMemo(
    () =>
      variableSpecs.map((spec) => {
        if (spec.variable == null) {
          return {
            role: spec.role,
          };
        }

        const { entityId, variableId } = spec.variable;

        const variableCompleteCases =
          completeCasesMap[`${entityId}.${variableId}`];

        if (variableCompleteCases == null) {
          return {
            role: spec.role,
            display: spec.display,
          };
        }

        const baseRowWithCounts = {
          role: spec.role,
          display: spec.display,
          complete: variableCompleteCases,
        };

        const variableFilteredEntityCount =
          filteredEntityCountsResult.value == null
            ? undefined
            : filteredEntityCountsResult.value[entityId];

        return variableFilteredEntityCount == null ||
          baseRowWithCounts.complete > variableFilteredEntityCount
          ? baseRowWithCounts
          : {
              ...baseRowWithCounts,
              total: variableFilteredEntityCount,
              incomplete:
                variableFilteredEntityCount - baseRowWithCounts.complete,
            };
      }),
    [completeCasesMap, filteredEntityCountsResult.value, variableSpecs]
  );
}

/**
 * Transforms a CompleteCasesTable array into a map
 * @param completeCases
 * @returns A map with key-value pairs of the form {entityId}.{variableId} -> {completeCaseCount}
 */
export function useCompleteCasesMap(
  completeCases: CompleteCasesTable = []
): Record<string, number> {
  return useMemo(
    () =>
      completeCases.reduce((memo, { completeCases, variableDetails }) => {
        if (completeCases != null && variableDetails != null) {
          // variableDetails.variableId is of the form {entityId}.{variableId}
          memo[variableDetails.variableId] = Array.isArray(completeCases)
            ? completeCases[0]
            : completeCases;
        }

        return memo;
      }, {} as Record<string, number>),
    [completeCases]
  );
}
