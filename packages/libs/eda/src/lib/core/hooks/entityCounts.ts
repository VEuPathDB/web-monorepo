import { useCallback } from 'react';
import { Filter } from '../types/filter';
import { usePromise } from './promise';
import {
  useStudyEntities,
  useStudyMetadata,
  useSubsettingClient,
} from './workspace';
import { useDebounce } from '../hooks/debouncing';
import { isStubEntity, STUB_ENTITY } from './study';

export type EntityCounts = Record<string, number>;

export function useEntityCounts(filters?: Filter[]) {
  const subsettingClient = useSubsettingClient();
  const { id, rootEntity } = useStudyMetadata();
  const entities = useStudyEntities();

  // debounce to prevent a back end call for each click on a filter checkbox
  const debouncedFilters = useDebounce(filters, 2000);

  return usePromise(
    useCallback(async () => {
      if (isStubEntity(rootEntity))
        return {
          [STUB_ENTITY.id]: 0,
        };
      const countsEntries = await Promise.all(
        entities.map((entity) =>
          subsettingClient
            .getEntityCount(id, entity.id, debouncedFilters ?? [])
            .then(
              ({ count }) => [entity.id, count],
              (error) => {
                console.warn(
                  'Could not load count for entity',
                  entity.id,
                  entity.displayName
                );
                console.error(error);
                return [entity.id, 0];
              }
            )
        )
      );
      return Object.fromEntries(countsEntries);
    }, [rootEntity, entities, subsettingClient, id, debouncedFilters])
  );
}
