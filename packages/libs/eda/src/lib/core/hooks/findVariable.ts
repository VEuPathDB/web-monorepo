import { useCallback } from 'react';

import { StudyEntity, StudyVariable } from '../types/study';
import { Variable } from '../types/variable';

interface FindVariableCallback {
  (variable?: Variable): StudyVariable | undefined;
}

export function useFindVariable(entities: StudyEntity[]): FindVariableCallback {
  return useCallback(
    (variable?: Variable) => {
      if (variable == null) return undefined;
      return entities
        .find((e) => e.id === variable.entityId)
        ?.variables.find((v) => v.id === variable.variableId);
    },
    [entities]
  );
}
