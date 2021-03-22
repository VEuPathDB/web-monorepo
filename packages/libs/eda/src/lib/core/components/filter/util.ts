import { Filter } from '../../types/filter';

type SummaryFetcher<T> = (filters: Filter[]) => Promise<T>;

type Context = {
  entityId: string;
  variableId: string;
  filters?: Filter[];
};

/**
 * Return a distribution object, using `fetchSummary`.
 * `fetchSummary` is call with background filters (empty set), and foreground filters
 * for the given `context`.
 * @param context
 * @param fetchSummary
 */
export async function getDistribution<T>(
  context: Context,
  fetchSummary: SummaryFetcher<T>
) {
  const { entityId, variableId, filters } = context;
  const foregroundFilters = filters?.filter(
    (f) => f.entityId !== entityId || f.variableId !== variableId
  );
  const background$ = fetchSummary([]);
  const foreground$ = foregroundFilters?.length
    ? fetchSummary(foregroundFilters)
    : background$;
  const [background, foreground] = await Promise.all([
    background$,
    foreground$,
  ]);
  return {
    background,
    foreground,
  };
}
