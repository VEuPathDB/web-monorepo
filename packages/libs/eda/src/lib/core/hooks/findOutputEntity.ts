import { useMemo } from 'react';
import { StudyEntity } from '../types/study';
import { VariableDescriptor } from '../types/variable';
import { useFindEntityAndVariable, useStudyEntities } from './workspace';
import { ancestorEntitiesForVariable } from '../utils/data-element-constraints';
import { sortBy } from 'lodash';

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
    const variableNames = dataElementDependencyOrder?.[0] ?? [
      fallbackVariableName,
    ];

    const variable = leastAncestralVariable(vizConfig, entities, variableNames);

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

/**
 * Given the current vizConfig and a list of variable 'names', e.g [ 'yAxisVariable', 'xAxisVariable' ]
 * this will figure out which variable selected for each of those is for the least ancestral entity
 * and it will return the variable (VariableDescriptor)
 *
 * Does not check that the two variables are on the same branch.
 * The variable constraints logic should already have checked that.
 */
function leastAncestralVariable(
  vizConfig: Record<string, unknown>,
  entities: StudyEntity[],
  variableNames: string[]
): VariableDescriptor | undefined {
  // the least ancestral variable has the most ancestors, so let's count them
  // and store in a record
  const ancestorCounts = variableNames.reduce((counts, variableName) => {
    // variableName -> number
    const variable = vizConfig[variableName];
    if (VariableDescriptor.is(variable))
      counts[variableName] = ancestorEntitiesForVariable(
        variable,
        entities
      ).length;
    else counts[variableName] = 0;
    return counts;
  }, {} as Record<string, number>);

  // sort by the counts, most-first
  const leastAncestralFirst = sortBy(
    variableNames,
    (name) => -ancestorCounts[name]
  );

  // we don't care about ties, because the same-branch constraint means that
  // the two variables will be from the same entity if they have the same number of ancestors
  const variable = vizConfig[leastAncestralFirst[0]];
  if (VariableDescriptor.is(variable)) return variable;
  else return undefined;
}
