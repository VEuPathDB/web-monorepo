import {
  Filter,
  StudyEntity,
  Variable,
  useFindEntityAndVariable,
} from '../../core';
import { useMemo } from 'react';
import { AppState } from './appState';
import { GeoConfig } from '../../core/types/geoConfig';
import { useDeepValue } from '../../core/hooks/immutability';
import { VariableDescriptor } from '../../core/types/variable';

export interface UseLittleFiltersProps {
  filters: Filter[] | undefined;
  appState: AppState;
  geoConfigs: GeoConfig[];
}

export interface UseLittleFiltersFuncProps extends UseLittleFiltersProps {
  findEntityAndVariable: (variableDescriptor?: VariableDescriptor) =>
    | {
        entity: StudyEntity;
        variable: Variable;
      }
    | undefined;
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
  props: UseLittleFiltersProps,
  funcs: ((props: UseLittleFiltersFuncProps) => Filter[])[]
) {
  const findEntityAndVariable = useFindEntityAndVariable(props.filters);
  const littleFilters = useDeepValue(
    useMemo(
      () =>
        funcs.reduce(
          (filters, func) => [
            ...filters,
            ...func({ ...props, findEntityAndVariable }),
          ],
          [] as Filter[]
        ),
      [props, funcs, findEntityAndVariable]
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
