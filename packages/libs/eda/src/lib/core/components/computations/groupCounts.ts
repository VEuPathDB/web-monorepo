import { useMemo } from 'react';
import { Filter } from '../../types/filter';
import { LabeledRange } from '../../api/DataClient/types';
import { VariableDescriptor } from '../../types/variable';
import { DifferentialExpressionMethod } from '../../types/apps';
import { useStudyMetadata } from '../../hooks/workspace';
import { useEntityCounts } from '../../hooks/entityCounts';

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
 * Returns a >=1 NumberRangeFilter on valueVariable for DESeq analyses, or
 * undefined for all other methods. Append this to any filter array passed to
 * the subsetting API so that samples with all-zero counts for the selected
 * gene set are excluded consistently across the UI (counts display, comparator
 * variable distribution), matching the R backend's removeEmptyRecords behaviour.
 *
 * A !=0 equivalent for limma/ArrayDataCollection does not currently exist in
 * the EDA filter repertoire — revisit if limma surfaces a similar edge case.
 */
export function makeDeseqExpressionFloorFilter(
  method: DifferentialExpressionMethod | undefined,
  valueVariable: VariableDescriptor | undefined
): Filter | undefined {
  if (method !== 'DESeq' || valueVariable == null) return undefined;
  return {
    type: 'numberRange',
    entityId: valueVariable.entityId,
    variableId: valueVariable.variableId,
    min: 1,
    max: Number.MAX_SAFE_INTEGER,
  };
}

/**
 * Hook that computes per-group sample counts for a comparator variable
 * split into two groups (A and B). Each group's filter is independently
 * memoised so that changing one group doesn't trigger a recount for the other.
 *
 * When method is 'DESeq' and valueVariable is provided, a >=1 floor filter is
 * silently appended so that the displayed counts match what the R backend will
 * actually use after removeEmptyRecords strips all-zero-count samples.
 */
export function useGroupCounts(
  comparatorVariable: VariableDescriptor | undefined,
  groupA: LabeledRange[] | undefined,
  groupB: LabeledRange[] | undefined,
  filters: Filter[] | undefined,
  method?: DifferentialExpressionMethod,
  valueVariable?: VariableDescriptor
): GroupCounts {
  const { rootEntity } = useStudyMetadata();

  const filtersWithFloor = useMemo(() => {
    const floorFilter = makeDeseqExpressionFloorFilter(method, valueVariable);
    if (floorFilter == null) return filters;
    return [...(filters ?? []), floorFilter];
  }, [method, valueVariable, filters]);

  const groupAFilter = useMemo(() => {
    if (!comparatorVariable || !groupA?.length) return undefined;
    return makeGroupFilter(comparatorVariable, groupA);
  }, [comparatorVariable, groupA]);

  const groupBFilter = useMemo(() => {
    if (!comparatorVariable || !groupB?.length) return undefined;
    return makeGroupFilter(comparatorVariable, groupB);
  }, [comparatorVariable, groupB]);

  const groupAFilters = useMemo(
    () =>
      groupAFilter ? [...(filtersWithFloor ?? []), groupAFilter] : undefined,
    [filtersWithFloor, groupAFilter]
  );
  const groupBFilters = useMemo(
    () =>
      groupBFilter ? [...(filtersWithFloor ?? []), groupBFilter] : undefined,
    [filtersWithFloor, groupBFilter]
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
