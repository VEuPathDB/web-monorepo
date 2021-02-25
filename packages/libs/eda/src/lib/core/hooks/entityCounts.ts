import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { Filter } from '../types/filter';
import { usePromise } from './promise';
import { useStudyMetadata, useSubsettingClient } from './workspace';

export function useEntityCounts(filters: Filter[]) {
  const { id, rootEntity } = useStudyMetadata();
  const subsettingClient = useSubsettingClient();
  return usePromise(async () => {
    const counts: Record<string, number> = {};
    for (const entity of preorder(rootEntity, (e) => e.children ?? [])) {
      const { count } = await subsettingClient.getEntityCount(
        id,
        entity.id,
        filters
      );
      counts[entity.id] = count;
    }
    return counts;
  }, [rootEntity, filters]);
}
