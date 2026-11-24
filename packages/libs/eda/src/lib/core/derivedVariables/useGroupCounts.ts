import { useCallback } from 'react';
import { useDebounce } from '../hooks/debouncing';
import { usePromise } from '../hooks/promise';
import {
  useDataClient,
  useStudyMetadata,
  useSubsettingClient,
} from '../hooks/workspace';
import { validateFilterDefinedGroups } from './groups';
import { FilterDefinedGroupsSpec } from './types';

const DEBOUNCE_MS = 500;

export interface GroupCounts {
  pending: boolean;
  /** Whole-dataset record count for each group's filters, by group index. */
  raw?: number[];
  /** Count per final level: group labels (first match wins) plus '' for no value. */
  final?: Record<string, number>;
}

/**
 * Whole-dataset counts for the group editor. Ignores the analysis subset
 * (§3.2). Raw and final counts are computed together for the same debounced
 * spec so they are never out of step.
 */
export function useGroupCounts(spec: FilterDefinedGroupsSpec): GroupCounts {
  const subsettingClient = useSubsettingClient();
  const dataClient = useDataClient();
  const { id: studyId } = useStudyMetadata();
  const debouncedSpec = useDebounce(spec, DEBOUNCE_MS);

  const task = useCallback(async () => {
    const { groups } = debouncedSpec.config;
    const [raw, total] = await Promise.all([
      Promise.all(
        groups.map((group) =>
          group.filters.length === 0
            ? Promise.resolve(0)
            : subsettingClient
                .getEntityCount(studyId, debouncedSpec.entityId, group.filters)
                .then((r) => r.count)
        )
      ),
      subsettingClient
        .getEntityCount(studyId, debouncedSpec.entityId, [])
        .then((r) => r.count),
    ]);
    // The server would reject an invalid spec, so skip the barplot.
    if (validateFilterDefinedGroups(debouncedSpec.config).length > 0)
      return { raw, final: undefined };
    const response = await dataClient.getBarplot('pass', {
      studyId,
      filters: [],
      derivedVariables: [debouncedSpec],
      config: {
        outputEntityId: debouncedSpec.entityId,
        valueSpec: 'count',
        barMode: 'group',
        xAxisVariable: {
          entityId: debouncedSpec.entityId,
          variableId: debouncedSpec.variableId,
        },
        showMissingness: 'TRUE',
      },
    });
    const final: Record<string, number> = {};
    let matched = 0;
    for (const series of response.barplot.data) {
      series.label.forEach((label, i) => {
        final[label] = (final[label] ?? 0) + series.value[i];
        matched += series.value[i];
      });
    }
    // Records in no group are dropped from the barplot (pass barplots only
    // support showMissingness for strata, not the x axis), so count them as
    // the entity total less the matched records.
    const unmatched = Math.max(0, total - matched);
    if (unmatched > 0) final[''] = unmatched;
    return { raw, final };
  }, [debouncedSpec, subsettingClient, dataClient, studyId]);

  const { value, pending } = usePromise(task, { keepPreviousValue: false });

  return {
    pending: pending || debouncedSpec !== spec,
    raw: value?.raw,
    final: value?.final,
  };
}
