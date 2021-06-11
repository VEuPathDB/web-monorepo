import { useMemo } from 'react';

import { CompleteCasesTable } from '../api/data-api';

/**
 * Transforms a CompleteCasesTable array into a map
 * @param completeCases
 * @returns A map with key-value pairs of the form {entityId}.{variableId} -> {completeCaseCount}
 */
export function useCompleteCases(
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
