import { useMemo } from 'react';
import { VariableDescriptor } from '../types/variable';
import { useFindEntityAndVariable, useStudyEntities } from './workspace';
import { leastAncestralVariable } from '../utils/data-element-constraints';

/**
 * Find the output entity, given variable details of a visualization.
 *
 * @param dataElementDependencyOrder Describes the dependency order of variable selections.
 * @param vizConfig Visualization configuration.
 * @param fallbackVariableName Fallback variable name, if `dataElementDependencyOrder` is empty.
 * @param providedEntityId Provided entity id, in cases where an app provides the output entity.
 * @returns
 */
export function useOutputEntity(
  dataElementDependencyOrder: string[][] | undefined,
  vizConfig: Record<string, unknown>,
  fallbackVariableName: string,
  providedEntityId?: string
) {
  const findEntityAndVariable = useFindEntityAndVariable();
  const entities = useStudyEntities();
  return useMemo(() => {
    if (providedEntityId)
      return entities.find((e) => e.id === providedEntityId);
    const variableNames = dataElementDependencyOrder?.flat() ?? [
      fallbackVariableName,
    ];

    const variables = variableNames
      .map((variableName) => vizConfig[variableName])
      .filter((v): v is VariableDescriptor => VariableDescriptor.is(v));

    const variable = leastAncestralVariable(variables, entities);

    // This could be more defensive and throw an error if variable is defined
    // but is not a VariableDescriptor.
    return VariableDescriptor.is(variable)
      ? findEntityAndVariable(variable)?.entity
      : undefined;
  }, [
    providedEntityId,
    entities,
    dataElementDependencyOrder,
    fallbackVariableName,
    vizConfig,
    findEntityAndVariable,
  ]);
}
