import { Filter } from '../types/filter';
import {
  useStudyEntities,
  useStudyMetadata,
  useSubsettingClient,
} from './workspace';
import { useDebounce } from '../hooks/debouncing';
import { isStubEntity, STUB_ENTITY } from './study';
import { StudyEntity } from '../types/study';
import { useCachedPromise } from './cachedPromise';

export type EntityCounts = Record<string, number>;

// Shared by useEntityCounts and useRootEntityCount. Fetches a count per given
// entity, in parallel; the returned promise is pending until all of them resolve,
// so callers should only pass the entities they actually need counts for.
function useEntityCountsForEntities(
  filters: Filter[] | undefined,
  entities: StudyEntity[]
) {
  const subsettingClient = useSubsettingClient();
  const { id, rootEntity } = useStudyMetadata();

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

export function useEntityCounts(filters?: Filter[]) {
  const entities = useStudyEntities();
  return useEntityCountsForEntities(filters, entities);
}

// Counts only the root entity, instead of fanning out a request per entity in
// the study. Use this whenever the root entity's count is all that's needed
// (e.g. sample-count gating) - useEntityCounts stays pending until every
// entity's count resolves, even if only one is ever read.
export function useRootEntityCount(filters?: Filter[]) {
  const { rootEntity } = useStudyMetadata();
  const result = useEntityCountsForEntities(filters, [rootEntity]);
  return { ...result, value: result.value?.[rootEntity.id] };
}
