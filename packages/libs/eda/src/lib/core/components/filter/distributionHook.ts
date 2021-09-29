import { useCallback } from 'react';
import DataClient from '../../api/DataClient';
import { usePromise } from '../../hooks/promise';
import { useDataClient } from '../../hooks/workspace';
import { Filter } from '../../types/filter';
import { StudyEntity, VariableTreeNode } from '../../types/study';

type SummaryFetcher<T> = (
  dataClient: DataClient,
  filters: Filter[]
) => Promise<T>;

export function useDataEndpoint<T>(
  variable: VariableTreeNode,
  entity: StudyEntity,
  filters: Filter[] | undefined,
  fetchSummary: SummaryFetcher<T>
) {
  const dataClient = useDataClient();
  return usePromise(
    useCallback(async () => {
      const foregroundFilters = filters?.filter(
        (f) => f.entityId !== entity.id || f.variableId !== variable.id
      );
      const background = await fetchSummary(dataClient, []);
      const foreground = foregroundFilters?.length
        ? await fetchSummary(dataClient, foregroundFilters)
        : background;
      return {
        background,
        foreground,
      };
    }, [filters, fetchSummary, dataClient, entity.id, variable.id])
  );
}
