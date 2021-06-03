import { useCallback } from 'react';
import { AnalysisState } from './analysis';

export function useToggleStarredVariable({
  analysis,
  setStarredVariables,
}: AnalysisState) {
  return useCallback(
    (targetVariableId: string) => {
      if (analysis == null) {
        return;
      }

      const oldStarredVariables = analysis.starredVariables;

      const newStarredVariables = !oldStarredVariables.includes(
        targetVariableId
      )
        ? [...oldStarredVariables, targetVariableId]
        : oldStarredVariables.filter(
            (variableId) => variableId !== targetVariableId
          );

      setStarredVariables(newStarredVariables);
    },
    [analysis, setStarredVariables]
  );
}
