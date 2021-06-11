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
      variables.map((variable) => {
        if (!variable.selected) {
          return {
            role: variable.spec.role,
          };
        }

        const variableCompleteCases =
          completeCasesMap[
            `${variable.spec.entityId}.${variable.spec.variableId}`
          ];

        if (variableCompleteCases == null) {
          return {
            role: variable.spec.role,
            display: variable.spec.display,
          };
        }

        const baseRowWithCounts = {
          role: variable.spec.role,
          display: variable.spec.display,
          complete: variableCompleteCases,
        };

        const variableFilteredEntityCount =
          filteredEntityCounts[variable.spec.entityId];

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
