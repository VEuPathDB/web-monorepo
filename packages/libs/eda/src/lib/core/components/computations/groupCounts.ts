import { useMemo } from 'react';
import { Filter } from '../../types/filter';
import { LabeledRange } from '../../api/DataClient/types';
import { VariableDescriptor } from '../../types/variable';
import { Variable } from '../../types/study';
import { DifferentialExpressionMethod } from '../../types/apps';
import { useRootEntityCount } from '../../hooks/entityCounts';

function makeGroupFilter(
  variable: VariableDescriptor,
  ranges: LabeledRange[],
  variableType?: Variable['type']
): Filter | undefined {
  if (!ranges.length) return undefined;
  if (variableType === 'date') {
    const mins = ranges.map((r) => r.min!);
    const maxes = ranges.map((r) => r.max!);
    return {
      type: 'dateRange',
      entityId: variable.entityId,
      variableId: variable.variableId,
      min: mins.reduce((a, b) => (a < b ? a : b)),
      max: maxes.reduce((a, b) => (a > b ? a : b)),
    };
  }
  if (variableType === 'number' || variableType === 'integer') {
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
  return {
    type: 'stringSet',
    entityId: variable.entityId,
    variableId: variable.variableId,
    stringSet: ranges.map((r) => r.label),
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
 * Returns a NumberRangeFilter on valueVariable to exclude samples with no
 * measurement (NA). For DESeq the floor is 1 (matching removeEmptyRecords);
 * for limma the range is [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] which admits all
 * real expression values while still dropping NAs.
 */
export function makeExpressionValueRangeFilter(
  method: DifferentialExpressionMethod | undefined,
  valueVariable: VariableDescriptor | undefined
): Filter | undefined {
  if (method == null || valueVariable == null) return undefined;
  return {
    type: 'numberRange',
    entityId: valueVariable.entityId,
    variableId: valueVariable.variableId,
    min: method === 'DESeq' ? 1 : Number.MIN_SAFE_INTEGER,
    max: Number.MAX_SAFE_INTEGER,
  };
}

export interface UseGroupCountsParams {
  comparatorVariable: VariableDescriptor | undefined;
  groupA: LabeledRange[] | undefined;
  groupB: LabeledRange[] | undefined;
  filters: Filter[] | undefined;
  method?: DifferentialExpressionMethod;
  valueVariable?: VariableDescriptor;
  comparatorVariableType?: Variable['type'];
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
export function useGroupCounts({
  comparatorVariable,
  groupA,
  groupB,
  filters,
  method,
  valueVariable,
  comparatorVariableType,
}: UseGroupCountsParams): GroupCounts {
  const filtersWithFloor = useMemo(() => {
    const floorFilter = makeExpressionValueRangeFilter(method, valueVariable);
    if (floorFilter == null) return filters;
    return [...(filters ?? []), floorFilter];
  }, [method, valueVariable, filters]);

  const groupAFilter = useMemo(() => {
    if (!comparatorVariable || !groupA?.length) return undefined;
    return makeGroupFilter(comparatorVariable, groupA, comparatorVariableType);
  }, [comparatorVariable, groupA, comparatorVariableType]);

  const groupBFilter = useMemo(() => {
    if (!comparatorVariable || !groupB?.length) return undefined;
    return makeGroupFilter(comparatorVariable, groupB, comparatorVariableType);
  }, [comparatorVariable, groupB, comparatorVariableType]);

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

  const groupACounts = useRootEntityCount(groupAFilters);
  const groupBCounts = useRootEntityCount(groupBFilters);

  const groupACount = groupAFilter != null ? groupACounts.value : undefined;
  const groupBCount = groupBFilter != null ? groupBCounts.value : undefined;
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
