import { useMemo } from 'react';

import { CompleteCasesTable } from '../api/data-api';
import {
  VariableCoverageTableRow,
  VariableSpec,
} from '../components/VariableCoverageTable';

/**
 * Returns an array of data to be rendered in a VariableCoverageTable
 * @param completeCases
 * @param filteredEntityCounts
 * @param variables
 * @returns A VariableCoverageTableRow[]
 */
export function useVariableCoverageTableRows(
  variables: VariableSpec[],
  completeCases?: CompleteCasesTable,
  filteredEntityCounts: Record<string, number> = {}
): VariableCoverageTableRow[] {
  const completeCasesMap = useCompleteCasesMap(completeCases);

  return useMemo(
    () =>
      variables.map((spec) => {
        if (!spec.selected) {
          return {
            role: spec.role,
          };
        }

        const variableCompleteCases =
          completeCasesMap[`${spec.entityId}.${spec.variableId}`];

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

        const variableFilteredEntityCount = filteredEntityCounts[spec.entityId];

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
    [completeCasesMap, filteredEntityCounts, variables]
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
