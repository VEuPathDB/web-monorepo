import { useCallback } from 'react';

import { isEqual, negate } from 'lodash/fp';

import { VariableDescriptor } from '../types/variable';

import { AnalysisState } from './analysis';

export function useToggleStarredVariable({
  analysis,
  setStarredVariables,
}: AnalysisState) {
  return useCallback(
    (targetVariable: VariableDescriptor) => {
      if (analysis == null) {
        return;
      }

      const oldStarredVariables = analysis.descriptor.starredVariables;

      const targetVariablePresent = oldStarredVariables.some(
        isEqual(targetVariable)
      );

      const newStarredVariables = !targetVariablePresent
        ? [...oldStarredVariables, targetVariable]
        : oldStarredVariables.filter(negate(isEqual(targetVariable)));

      setStarredVariables(newStarredVariables);
    },
    [analysis, setStarredVariables]
  );
}
