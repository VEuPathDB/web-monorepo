import { useCallback } from 'react';
import { SessionState } from './session';

export function useToggleStarredVariable({
  session,
  setStarredVariables,
}: SessionState) {
  return useCallback(
    (targetVariableId: string) => {
      if (session == null) {
        return;
      }

      const oldStarredVariables = session.starredVariables;

      const newStarredVariables = !oldStarredVariables.includes(
        targetVariableId
      )
        ? [...oldStarredVariables, targetVariableId]
        : oldStarredVariables.filter(
            (variableId) => variableId !== targetVariableId
          );

      setStarredVariables(newStarredVariables);
    },
    [session, setStarredVariables]
  );
}
