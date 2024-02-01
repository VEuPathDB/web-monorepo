import { Filter, StudyEntity, Variable } from '../../core';
import { useMemo } from 'react';
import { AppState } from './appState';
import { GeoConfig } from '../../core/types/geoConfig';
import { useDeepValue } from '../../core/hooks/immutability';
import { VariableDescriptor } from '../../core/types/variable';

export interface useLittleFiltersProps {
  filters: Filter[] | undefined;
  appState: AppState;
  geoConfigs: GeoConfig[];
  findEntityAndVariable?: (
    vd: VariableDescriptor
  ) => { entity: StudyEntity; variable: Variable } | undefined;
}

//
// returns stable lists of Filters
//   filters: main filters plus requested little filters
//   littleFilters: just the requested little filters
//
// funcs: is a list of functions that produce filters
//
// assumes `filters` prop is already referentially stable
//
export function useLittleFilters(
  props: useLittleFiltersProps,
  funcs: ((props: useLittleFiltersProps) => Filter[])[]
) {
  const littleFilters = useDeepValue(
    useMemo(
      () =>
        funcs.reduce(
          (filters, func) => [...filters, ...func(props)],
          [] as Filter[]
        ),
      [props, funcs]
    )
  );

  const filters = useMemo(
    () => [...(props.filters ?? []), ...littleFilters],
    [props.filters, littleFilters]
  );

  return {
    littleFilters,
    filters,
  };
}
