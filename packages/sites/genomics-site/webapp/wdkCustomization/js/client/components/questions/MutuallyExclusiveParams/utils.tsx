import { Dictionary, flowRight, isNil, mapValues, negate, values } from 'lodash';
import { createSelector } from 'reselect';

import { QuestionState } from 'wdk-client/StoreModules/QuestionStoreModule';
import { ParameterGroup, Question } from 'wdk-client/Utils/WdkModel';

const findXorGroup = (xorGrouping: Dictionary<string[]>) => (question: Question) => {
  return question.groups.find(group => {
    const groupParameterSet = new Set(group.parameters);

    return values(xorGrouping).every(
      xorGroupKeys => xorGroupKeys.some(
        xorGroupKey => groupParameterSet.has(xorGroupKey)
      )
    );
  });
}

const findXorGroupKey = (xorGrouping: Dictionary<string[]>) => (question: Question): string => {
  const xorGroup = findXorGroup(xorGrouping)(question);

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
  (state: QuestionState) => state.question,
  findXorGroupKey(xorGroupingByChromosomeAndSequenceID)
);

export const groupXorParametersByChromosomeAndSequenceID = createSelector(
  (state: QuestionState) => state,
  keyForXorGroupingByChromosomeAndSequenceID,
  groupXorParameters(xorGroupingByChromosomeAndSequenceID)
);

const findChromosomeAndSequenceIDXorGrouping = findXorGroup(xorGroupingByChromosomeAndSequenceID);

export const hasChromosomeAndSequenceIDXorGrouping = flowRight(
  negate(isNil),
  findChromosomeAndSequenceIDXorGrouping
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
