import { Dictionary, mapValues, values } from 'lodash';
import { createSelector } from 'reselect';

import { QuestionState } from '@veupathdb/wdk-client/lib/StoreModules/QuestionStoreModule';
import {
  ParameterGroup,
  Question,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';

const ORGANISM_PARAMS = ['organismSinglePick'];
const CHROMOSOME_PARAMS = [
  'chromosomeOptional',
  'chromosomeOptionalForNgsSnps',
];
const SEQUENCE_ID_PARAMS = ['sequenceId'];

const findXorGroup =
  (xorGrouping: Dictionary<string[]>) => (question: Question) => {
    return question.groups.find((group) => {
      const groupParameterSet = new Set(group.parameters);

      return values(xorGrouping).every((xorGroupKeys) =>
        xorGroupKeys.some((xorGroupKey) => groupParameterSet.has(xorGroupKey))
      );
    });
  };

const findXorGroupKey =
  (xorGrouping: Dictionary<string[]>) =>
  (question: Question): string => {
    const xorGroup = findXorGroup(xorGrouping)(question);

    return xorGroup === undefined ? 'hidden' : xorGroup.name;
  };

const groupXorParameters =
  (xorGrouping: Dictionary<string[]>) =>
  (state: QuestionState, xorGroupKey: string): Dictionary<string[]> => {
    const xorGroupingUniverse = values(xorGrouping).flat();
    const xorGroupingSets = mapValues(
      xorGrouping,
      (parameterKeys) => new Set(parameterKeys)
    );
    const xorGroupingNegations = mapValues(xorGroupingSets, (parameterSet) => {
      const negation = xorGroupingUniverse.filter(
        (parameterKey) => !parameterSet.has(parameterKey)
      );
      return new Set(negation);
    });

    const xorGroup = state.question.groupsByName[xorGroupKey];

    return xorGroup === undefined
      ? mapValues(xorGroupingNegations, () => [])
      : mapValues(xorGroupingNegations, (xorGroupingNegation) =>
          xorGroup.parameters.filter(
            (parameter) => !xorGroupingNegation.has(parameter)
          )
        );
  };

export const xorGroupingByChromosomeAndSequenceID = {
  Chromosome: [...ORGANISM_PARAMS, ...CHROMOSOME_PARAMS],
  'Sequence ID': SEQUENCE_ID_PARAMS,
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

const findChromosomeAndSequenceIDXorGroup = findXorGroup(
  xorGroupingByChromosomeAndSequenceID
);

const groupHasParam =
  (groupParamNames: Set<string>) => (targetParamName: string) => {
    return groupParamNames.has(targetParamName);
  };

export const hasChromosomeAndSequenceIDXorGroup = (question: Question) => {
  const xorGroup = findChromosomeAndSequenceIDXorGroup(question);

  const xorGroupParamNames = new Set(xorGroup?.parameters);
  const xorGroupHasParam = groupHasParam(xorGroupParamNames);

  return [ORGANISM_PARAMS, CHROMOSOME_PARAMS, SEQUENCE_ID_PARAMS].every(
    (validParamTypes) => validParamTypes.some(xorGroupHasParam)
  );
};

export const findChromosomeOptionalKey = (paramNames: string[]) =>
  paramNames.includes('chromosomeOptionalForNgsSnps')
    ? 'chromosomeOptionalForNgsSnps'
    : 'chromosomeOptional';

export const findSequenceIdKey = (paramNames: string[]) => 'sequenceId';

export const restrictParameterGroup = (
  group: ParameterGroup,
  parameterKeys: string[]
): ParameterGroup => {
  const parameterKeySet = new Set(parameterKeys);

  return {
    ...group,
    parameters: group.parameters.filter((key) => parameterKeySet.has(key)),
  };
};
