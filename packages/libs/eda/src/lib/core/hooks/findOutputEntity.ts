import { useMemo } from 'react';
import { VariableDescriptor } from '../types/variable';
import { useFindEntityAndVariable, useStudyEntities } from './workspace';

/**
 * Find the output entity, given variable details of a visualization.
 *
 * @param dataElementDependencyOrder Describes the dependency order of variable selections.
 * @param vizConfig Visualization configuration.
 * @param fallbackVariableName Fallback variable name, if `dataElementDependencyOrder` is empty.
 * @param providedEntityId Provided entity id, in cases where an app provides the output entity.
 * @returns
 */
export function useFindOutputEntity(
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
    const variableName =
      dataElementDependencyOrder?.[0][0] ?? fallbackVariableName;
    const variable = vizConfig[variableName];
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
