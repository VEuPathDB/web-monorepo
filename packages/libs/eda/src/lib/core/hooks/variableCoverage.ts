import { useMemo } from 'react';

import { CompleteCasesTable } from '../api/data-api';
import {
  VariableCoverageTableRow,
  VariableSpec,
} from '../components/VariableCoverageTable';
import { Filter } from '../types/filter';

import { useEntityCounts } from './entityCounts';
// use toPercentage function for handling very high or small percentage
import { toPercentage } from '@veupathdb/wdk-client/lib/Components/AttributeFilter/AttributeFilterUtils';

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
  filters?: Filter[],
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
          // use toPercentage function for handling very high or small percentage
          completePercent: toPercentage(
            baseRowWithCounts.completeCount,
            variableFilteredEntityCount
          ),
          incompletePercent: toPercentage(
            incompleteCount,
            variableFilteredEntityCount
          ),
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
  return useMemo(
    () =>
      // the reduce essentially performs a lodash.keyBy, with empty row protection
      completeCasesTable.reduce((map, { completeCases, variableDetails }) => {
        if (completeCases != null && variableDetails != null) {
          const key = `${variableDetails.entityId}.${variableDetails.variableId}`;
          map[key] = completeCases;
        }
        return map;
      }, {} as Record<string, number>),
    [completeCasesTable]
  );
}
