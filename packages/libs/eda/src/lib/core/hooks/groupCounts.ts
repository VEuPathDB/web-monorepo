import { useMemo } from 'react';
import { Filter } from '../types/filter';
import { LabeledRange } from '../api/DataClient/types';
import { VariableDescriptor } from '../types/variable';
import { useStudyMetadata } from './workspace';
import { useEntityCounts } from './entityCounts';

function makeGroupFilter(
  variable: VariableDescriptor,
  ranges: LabeledRange[]
): Filter | undefined {
  if (!ranges.length) return undefined;
  const isContinuous = ranges[0].min != null;
  if (!isContinuous) {
    return {
      type: 'stringSet',
      entityId: variable.entityId,
      variableId: variable.variableId,
      stringSet: ranges.map((r) => r.label),
    };
  }
  const mins = ranges.map((r) => parseFloat(r.min!));
  const maxes = ranges.map((r) => parseFloat(r.max!));
  return {
    type: 'numberRange',
    entityId: variable.entityId,
    variableId: variable.variableId,
    min: Math.min(...mins),
    max: Math.max(...maxes),
  };
}

export interface GroupCounts {
  groupACount: number | undefined;
  groupBCount: number | undefined;
  groupACountPending: boolean;
  groupBCountPending: boolean;
  groupAFilter: Filter | undefined;
  groupBFilter: Filter | undefined;
}

/**
 * Hook that computes per-group sample counts for a comparator variable
 * split into two groups (A and B). Each group's filter is independently
 * memoised so that changing one group doesn't trigger a recount for the other.
 */
export function useGroupCounts(
  comparatorVariable: VariableDescriptor | undefined,
  groupA: LabeledRange[] | undefined,
  groupB: LabeledRange[] | undefined,
  filters: Filter[] | undefined
): GroupCounts {
  const { rootEntity } = useStudyMetadata();

  const groupAFilter = useMemo(() => {
    if (!comparatorVariable || !groupA?.length) return undefined;
    return makeGroupFilter(comparatorVariable, groupA);
  }, [comparatorVariable, groupA]);

  const groupBFilter = useMemo(() => {
    if (!comparatorVariable || !groupB?.length) return undefined;
    return makeGroupFilter(comparatorVariable, groupB);
  }, [comparatorVariable, groupB]);

  const groupAFilters = useMemo(
    () => (groupAFilter ? [...(filters ?? []), groupAFilter] : undefined),
    [filters, groupAFilter]
  );
  const groupBFilters = useMemo(
    () => (groupBFilter ? [...(filters ?? []), groupBFilter] : undefined),
    [filters, groupBFilter]
  );

  const groupACounts = useEntityCounts(groupAFilters);
  const groupBCounts = useEntityCounts(groupBFilters);

  const rootEntityId = rootEntity.id;
  const groupACount =
    groupAFilter != null ? groupACounts.value?.[rootEntityId] : undefined;
  const groupBCount =
    groupBFilter != null ? groupBCounts.value?.[rootEntityId] : undefined;
  const groupACountPending = groupAFilter != null && groupACounts.pending;
  const groupBCountPending = groupBFilter != null && groupBCounts.pending;

  return {
    groupACount,
    groupBCount,
    groupACountPending,
    groupBCountPending,
    groupAFilter,
    groupBFilter,
  };
}
