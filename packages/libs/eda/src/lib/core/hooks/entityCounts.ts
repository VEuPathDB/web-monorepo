import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { useCallback } from 'react';
import { Filter } from '../types/filter';
import { usePromise } from './promise';
import { useStudyMetadata, useSubsettingClient } from './workspace';
import { useDebounce } from '../hooks/debouncing';
import { isStubEntity, STUB_ENTITY } from './study';

export type EntityCounts = Record<string, number>;

export function useEntityCounts(filters: Filter[] = []) {
  const { id, rootEntity } = useStudyMetadata();
  const subsettingClient = useSubsettingClient();

  const isStub = isStubEntity(rootEntity);

  // use JSON version in dependencies to prevent unnecessary recalculations
  // debounce to prevent a back end call for each click on a filter checkbox
  const filtersJSON = useDebounce(JSON.stringify(filters), 2000);

  return usePromise(
    useCallback(async () => {
      if (isStub)
        return {
          [STUB_ENTITY.id]: 0,
        };
      const counts: Record<string, number> = {};
      for (const entity of preorder(rootEntity, (e) => e.children ?? [])) {
        const { count } = await subsettingClient
          .getEntityCount(id, entity.id, filters)
          .catch((error) => {
            console.warn(
              'Could not load count for entity',
              entity.id,
              entity.displayName
            );
            console.error(error);
            return { count: 0 };
          });
        counts[entity.id] = count;
      }
      return counts;
    }, [rootEntity, isStub, subsettingClient, id, filtersJSON]) // do NOT add `filters` here
  );
}
