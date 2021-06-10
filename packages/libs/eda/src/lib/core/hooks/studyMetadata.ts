import { useCallback } from 'react';

import { StudyEntity } from '../types/study';
import { Variable } from '../types/variable';
import { findEntityAndVariable } from '../utils/study-metadata';

export function useFindEntityAndVariable(entities: StudyEntity[]) {
  return useCallback(
    (variable?: Variable) => findEntityAndVariable(entities, variable),
    [entities]
  );
}
