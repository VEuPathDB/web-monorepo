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
/** How the barplot response labels records with no value. */
const NO_DATA_LABEL = 'No data';

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
    const raw = await Promise.all(
      groups.map((group) =>
        group.filters.length === 0
          ? Promise.resolve(0)
          : subsettingClient
              .getEntityCount(studyId, debouncedSpec.entityId, group.filters)
              .then((r) => r.count)
      )
    );
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
    const groupLabels = new Set(groups.map((g) => g.label));
    const final: Record<string, number> = {};
    for (const series of response.barplot.data) {
      series.label.forEach((label, i) => {
        const key =
          label === NO_DATA_LABEL && !groupLabels.has(label) ? '' : label;
        final[key] = (final[key] ?? 0) + series.value[i];
      });
    }
    return { raw, final };
  }, [debouncedSpec, subsettingClient, dataClient, studyId]);

  const { value, pending } = usePromise(task, { keepPreviousValue: false });

  return {
    pending: pending || debouncedSpec !== spec,
    raw: value?.raw,
    final: value?.final,
  };
}
