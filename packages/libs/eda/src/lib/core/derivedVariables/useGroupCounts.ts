import { useMemo } from 'react';
import { useCachedPromise, useCachedPromises } from '../hooks/cachedPromise';
import { useDebounce } from '../hooks/debouncing';
import { useEntityCounts } from '../hooks/entityCounts';
import {
  useDataClient,
  useStudyEntities,
  useStudyMetadata,
  useSubsettingClient,
} from '../hooks/workspace';
import { validateFilterDefinedGroups } from './groups';
import { toStoredSpec } from './recoding';
import { FilterDefinedGroupsSpec } from './types';

const DEBOUNCE_MS = 500;

export interface GroupCounts {
  pending: boolean;
  /** Whole-dataset record count for each group's filters, by group index. */
  raw?: number[];
  /** Count per final level: group labels (first match wins) plus '' for no value. */
  final?: Record<string, number>;
  /** The first error from any of the underlying requests. */
  error?: unknown;
}

/**
 * Whole-dataset counts for the group editor. Ignores the analysis subset
 * (§3.2). Three independent cached sources are issued at once: the entity
 * total (normally already cached by the workspace), a raw count per group
 * (keyed on that group's filters), and the barplot of the stored spec (keyed
 * on everything but the display name). So an edit only re-requests what it
 * changes.
 */
export function useGroupCounts(spec: FilterDefinedGroupsSpec): GroupCounts {
  const subsettingClient = useSubsettingClient();
  const dataClient = useDataClient();
  const { id: studyId } = useStudyMetadata();
  const entities = useStudyEntities();
  const debouncedSpec = useDebounce(spec, DEBOUNCE_MS);
  const { entityId } = debouncedSpec;

  const totalState = useEntityCounts();
  const total = totalState.value?.[entityId];

  const rawStates = useCachedPromises<number>(
    debouncedSpec.config.groups.map((group) => ({
      // A group with no filters counts 0 without a request.
      task: () =>
        group.filters.length === 0
          ? Promise.resolve(0)
          : subsettingClient
              .getEntityCount(studyId, entityId, group.filters)
              .then((r) => r.count),
      queryKey: ['groupRawCount', studyId, entityId, group.filters],
    }))
  );

  // The server would reject an invalid spec, so leave the barplot disabled.
  const stored = useMemo(
    () =>
      validateFilterDefinedGroups(debouncedSpec.config).length > 0
        ? undefined
        : toStoredSpec(debouncedSpec, entities),
    [debouncedSpec, entities]
  );
  const finalKeySpec = useMemo(() => {
    if (stored == null) return undefined;
    const { displayName: _displayName, ...rest } = stored;
    return rest;
  }, [stored]);

  const finalState = useCachedPromise(async () => {
    // Count with the form that will be saved, so the numbers match the plots.
    const response = await dataClient.getBarplot('pass', {
      studyId,
      filters: [],
      derivedVariables: stored ? [stored] : [],
      config: {
        outputEntityId: entityId,
        valueSpec: 'count',
        barMode: 'group',
        xAxisVariable: { entityId, variableId: debouncedSpec.variableId },
        showMissingness: 'TRUE',
      },
    });
    const byLabel: Record<string, number> = {};
    let matched = 0;
    for (const series of response.barplot.data) {
      series.label.forEach((label, i) => {
        byLabel[label] = (byLabel[label] ?? 0) + series.value[i];
        matched += series.value[i];
      });
    }
    return { byLabel, matched };
  }, ['groupFinalCounts', studyId, finalKeySpec]);

  // Joined so that raw's identity only changes when its numbers do.
  const rawKey = rawStates.every((s) => s.value != null)
    ? rawStates.map((s) => s.value).join(',')
    : undefined;
  const raw = useMemo(
    () =>
      rawKey == null
        ? undefined
        : rawKey === ''
        ? []
        : rawKey.split(',').map(Number),
    [rawKey]
  );

  const finalValue = finalState.value;
  const final = useMemo(() => {
    if (finalValue == null || total == null) return undefined;
    const result = { ...finalValue.byLabel };
    // Records in no group are dropped from the barplot (pass barplots only
    // support showMissingness for strata, not the x axis), so count them as
    // the entity total less the matched records.
    const unmatched = Math.max(0, total - finalValue.matched);
    if (unmatched > 0) result[''] = unmatched;
    return result;
  }, [finalValue, total]);

  const error =
    rawStates.find((s) => s.error != null)?.error ??
    finalState.error ??
    totalState.error;

  return {
    pending:
      debouncedSpec !== spec ||
      rawStates.some((s) => s.pending) ||
      finalState.pending ||
      totalState.pending,
    raw,
    final,
    error: error ?? undefined,
  };
}
