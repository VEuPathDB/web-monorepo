import { Filter } from '../types/filter';
import {
  useStudyEntities,
  useStudyMetadata,
  useSubsettingClient,
} from './workspace';
import { useDebounce } from '../hooks/debouncing';
import { isStubEntity, STUB_ENTITY } from './study';
import { useCachedPromise } from './cachedPromise';

export type EntityCounts = Record<string, number>;

export function useEntityCounts(filters?: Filter[]) {
  const subsettingClient = useSubsettingClient();
  const { id, rootEntity } = useStudyMetadata();
  const entities = useStudyEntities();

  // debounce to prevent a back end call for each click on a filter checkbox
  const debouncedFilters = useDebounce(filters, 2000);

  // True during the debounce window: filters have changed but the API call hasn't started yet.
  const stalePending = filters !== debouncedFilters;

  const result = useCachedPromise<Record<string, number>>(async () => {
    if (isStubEntity(rootEntity))
      return {
        [STUB_ENTITY.id]: 0,
      };
    // Errors propagate to react-query's retry/error handling via useCachedPromise
    const countsEntries = await Promise.all(
      entities.map(
        (entity): Promise<[string, number]> =>
          subsettingClient
            .getEntityCount(id, entity.id, debouncedFilters ?? [])
            .then(({ count }) => [entity.id, count])
      )
    );
    return Object.fromEntries(countsEntries);
  }, [rootEntity, entities, subsettingClient, id, debouncedFilters ?? []]);

  // Note: the merging of stalePending may change the behaviour of
  // count-based spinners - no data integrity issues, just potentially more spinning
  // during the debounce window
  return { ...result, pending: result.pending || stalePending };
}
