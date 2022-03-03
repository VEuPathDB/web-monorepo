import { useMemo } from 'react';

import { StudyEntity } from '../../../core';
import { EntityCounts } from '../../../core/hooks/entityCounts';

// DAVE/JAMIE: We *might* want to move this type definition and hook to
// a more common location if you think it could have relevance to
// other use-cases.
export type EnhancedEntityData = Array<EnhancedEntityDatum>;

export type EnhancedEntityDatum = StudyEntity & {
  filteredCount: number;
  totalCount: number;
};

/**
 * Enhance entity data with total and filtered counts.
 *
 * The goal here is to augment existing StudyEntity records
 * with the number of actual records (both total and filtered) for
 * the entity in the currently selected study.
 * */
export function useEnhancedEntityData(
  entities: StudyEntity[],
  totalCounts: EntityCounts | undefined,
  filteredCounts: EntityCounts | undefined
): EnhancedEntityData {
  return useMemo(() => {
    const filteredCountsAsArray = Object.entries(filteredCounts ?? {});
    const totalCountsAsArray = Object.entries(totalCounts ?? {});

    if (!filteredCounts || !totalCounts) return [];

    return entities.map((entity) => ({
      ...entity,
      filteredCount: filteredCountsAsArray.find(
        ([entityID]) => entityID === entity.id
      )![1],
      totalCount: totalCountsAsArray.find(
        ([entityID]) => entityID === entity.id
      )![1],
    }));
  }, [entities, filteredCounts, totalCounts]);
}
