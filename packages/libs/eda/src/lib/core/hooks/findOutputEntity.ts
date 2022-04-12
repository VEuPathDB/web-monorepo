import { useMemo } from 'react';
import { VariableDescriptor } from '../types/variable';
import { StudyEntity } from '../types/study';
import { useFindEntityAndVariable } from './study';
// add NumberRange
import { NumberOrDateRange } from '../types/general';

export function useFindOutputEntity(
  dataElementDependencyOrder: string[] | undefined,
  // need to add string at Record's Type due to valueSpecConfig
  dataElementVariables: Record<
    string,
    // add NumberRange
    | VariableDescriptor
    | string
    | number // for binWidth at LineplotViz
    | boolean
    | string[]
    | NumberOrDateRange
    | undefined
  >,
  defaultVariableName: string,
  entities: StudyEntity[]
) {
  const findEntityAndVariable = useFindEntityAndVariable(entities);
  return useMemo(() => {
    const variableName =
      dataElementDependencyOrder == null ||
      dataElementDependencyOrder.length === 0
        ? defaultVariableName
        : dataElementDependencyOrder[0];
    const variable = dataElementVariables[variableName];
    // need to clarify 'as VariableDescriptor' due to Record Type's string (valueSpecConfig)
    return findEntityAndVariable(variable as VariableDescriptor)?.entity;
  }, [
    dataElementDependencyOrder,
    dataElementVariables,
    defaultVariableName,
    findEntityAndVariable,
  ]);
}
