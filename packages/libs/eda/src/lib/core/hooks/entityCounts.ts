import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Filter } from '../types/filter';
import { usePromise } from './promise';
import { useStudyMetadata, useSubsettingClient } from './workspace';
import { debounce } from 'lodash';

export function useEntityCounts(filters?: Filter[]) {
  const { id, rootEntity } = useStudyMetadata();
  const subsettingClient = useSubsettingClient();

  // use JSON version in dependencies to prevent unnecessary recalculations
  const filtersJSON = JSON.stringify(filters);

  // debounce the dependencies of the useCallback below
  const [counter, setCounter] = useState(0);
  const debouncedSetCounter = useMemo(
    () => debounce(setCounter, 2000, { leading: true, trailing: true }),
    []
  );
  useEffect(() => debouncedSetCounter.cancel, []);
  useEffect(() => {
    debouncedSetCounter((count) => count + 1);
  }, [rootEntity, subsettingClient, id, filtersJSON]);

  return usePromise(
    useCallback(async () => {
      const counts: Record<string, number> = {};
      for (const entity of preorder(rootEntity, (e) => e.children ?? [])) {
        const { count } = await subsettingClient
          .getEntityCount(id, entity.id, filters ?? [])
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
    }, [counter]) // debounced [rootEntity, subsettingClient, id, filtersJSON]
  );
}
