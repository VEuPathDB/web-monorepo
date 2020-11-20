import { Dictionary, mapValues, values } from 'lodash';
import { createSelector } from 'reselect';

import { QuestionState } from '@veupathdb/wdk-client/lib/StoreModules/QuestionStoreModule';
import { ParameterGroup } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

const findXorGroupKey = (xorGrouping: Dictionary<string[]>) => (state: QuestionState): string => {
  const xorGroup = state.question.groups.find(group => {
    const groupParameterSet = new Set(group.parameters);

    return values(xorGrouping).every(
      xorGroupKeys => xorGroupKeys.some(
        xorGroupKey => groupParameterSet.has(xorGroupKey)
      )
    );
  });

  return xorGroup === undefined
    ? 'hidden'
    : xorGroup.name;
}

const groupXorParameters = (xorGrouping: Dictionary<string[]>) => (state: QuestionState, xorGroupKey: string): Dictionary<string[]> => {
  const xorGroupingUniverse = values(xorGrouping).flat();
  const xorGroupingSets = mapValues(xorGrouping, parameterKeys => new Set(parameterKeys));
  const xorGroupingNegations = mapValues(xorGroupingSets, parameterSet => {
    const negation = xorGroupingUniverse.filter(parameterKey => !parameterSet.has(parameterKey));
    return new Set(negation);
  });

  const xorGroup = state.question.groupsByName[xorGroupKey];

  return xorGroup === undefined
    ? mapValues(
        xorGroupingNegations,
        () => []
      )
    : mapValues(
        xorGroupingNegations,
        xorGroupingNegation => xorGroup.parameters.filter(parameter =>
          !xorGroupingNegation.has(parameter)
        )
      );
};

export const xorGroupingByChromosomeAndSequenceID = {
  'Chromosome': ['organismSinglePick', 'chromosomeOptional', 'chromosomeOptionalForNgsSnps'],
  'Sequence ID': ['sequenceId']
};

export const keyForXorGroupingByChromosomeAndSequenceID = createSelector(
  (state: QuestionState) => state,
  findXorGroupKey(xorGroupingByChromosomeAndSequenceID)
);

export const groupXorParametersByChromosomeAndSequenceID = createSelector(
  (state: QuestionState) => state,
  keyForXorGroupingByChromosomeAndSequenceID,
  groupXorParameters(xorGroupingByChromosomeAndSequenceID)
);

export const findChromosomeOptionalKey = (paramNames: string[]) => 
  paramNames.includes('chromosomeOptionalForNgsSnps') ? 'chromosomeOptionalForNgsSnps' : 'chromosomeOptional';

export const findSequenceIdKey = (paramNames: string[]) => 'sequenceId';

export const restrictParameterGroup = (group: ParameterGroup, parameterKeys: string[]): ParameterGroup => {
  const parameterKeySet = new Set(parameterKeys);

  return {
    ...group,
    parameters: group.parameters.filter(key  => parameterKeySet.has(key))
  };
};
