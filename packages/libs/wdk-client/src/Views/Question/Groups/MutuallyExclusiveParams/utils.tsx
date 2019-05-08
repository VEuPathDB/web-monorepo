import { QuestionState } from 'wdk-client/StoreModules/QuestionStoreModule';

import { Dictionary, keys, mapValues, values } from 'lodash';
import { createSelector } from 'reselect';

const groupXorSubstates = (xorGrouping: Dictionary<string[]>) => (state: QuestionState): Dictionary<QuestionState> => {
  const xorGroupingUniverse = values(xorGrouping).flat();
  const xorGroupingSets = mapValues(xorGrouping, parameterKeys => new Set(parameterKeys));
  const xorGroupingNegations = mapValues(xorGroupingSets, parameterSet => {
    const negation = xorGroupingUniverse.filter(parameterKey => !parameterSet.has(parameterKey));
    return new Set(negation);
  });

  return mapValues(
    xorGroupingNegations,
    xorGroupingNegation => {
      return {
        ...state,
        question: {
          ...state.question,
          groups: state.question.groups.filter(
            group => !xorGroupingNegation.has(group.name)
          )
        }
      };
    }
  );
};

const isXorGroupingNeeded = (xorGrouping: Dictionary<string[]>) => (xorSubstates: Dictionary<QuestionState>) => 
  keys(xorGrouping).every(xorGroupKey => xorSubstates[xorGroupKey].question.groups.length > 0);

const xorGroupingByChromosomeAndSequenceID = {
  'Chromosome': ['organismSinglePick', 'chromosomeOptional', 'chromosomeOptionalForNgsSnps'],
  'Sequence ID': ['sequenceId']
};

export const groupXorSubstatesByChromosomeAndSequenceID = createSelector(
  (state: QuestionState) => state,
  groupXorSubstates(xorGroupingByChromosomeAndSequenceID)
);

export const isXorGroupingByChromosomeAndSequenceIDNeeded = createSelector(
  groupXorSubstatesByChromosomeAndSequenceID,
  isXorGroupingNeeded(xorGroupingByChromosomeAndSequenceID)
);
