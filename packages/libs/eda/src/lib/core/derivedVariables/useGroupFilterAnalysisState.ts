import { useMemo, useRef } from 'react';
import { AnalysisState } from '../hooks/analysis';
import { Analysis, NewAnalysis } from '../types/analysis';
import { Filter } from '../types/filter';

export interface GroupFilterState {
  filters: Filter[];
  uiSettings: Analysis['descriptor']['subset']['uiSettings'];
}

type Update<T> = T | ((value: T) => T);

function resolve<T>(update: Update<T>, current: T): T {
  return typeof update === 'function'
    ? (update as (value: T) => T)(current)
    : update;
}

/**
 * Adapts an AnalysisState so that Browse and Subset widgets edit one group's
 * filters and UI settings instead of the analysis subset. Every other member
 * is passed through unchanged.
 */
export function useGroupFilterAnalysisState(
  base: AnalysisState,
  group: GroupFilterState,
  onChange: (next: GroupFilterState) => void
): AnalysisState {
  // Refreshed from props on every render, and advanced after each change so
  // several updates in one tick compose instead of overwriting each other.
  const latest = useRef({ group, onChange });
  latest.current = { group, onChange };

  return useMemo(() => {
    const analysis = base.analysis;
    const adaptedAnalysis: Analysis | NewAnalysis | undefined = analysis && {
      ...analysis,
      descriptor: {
        ...analysis.descriptor,
        subset: {
          ...analysis.descriptor.subset,
          descriptor: group.filters,
          uiSettings: group.uiSettings,
        },
      },
    };
    return {
      ...base,
      analysis: adaptedAnalysis,
      setFilters: (update) => {
        const { group, onChange } = latest.current;
        const next = { ...group, filters: resolve(update, group.filters) };
        latest.current = { group: next, onChange };
        onChange(next);
      },
      setVariableUISettings: (update) => {
        const { group, onChange } = latest.current;
        const next = {
          ...group,
          uiSettings: resolve(update, group.uiSettings),
        };
        latest.current = { group: next, onChange };
        onChange(next);
      },
    };
  }, [base, group.filters, group.uiSettings]);
}
