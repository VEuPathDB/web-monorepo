import * as t from 'io-ts';
import { useDeepValue } from '../../core/hooks/immutability';
import { Filter, useFindEntityAndVariable } from '../../core';
import { useCallback, useMemo } from 'react';
import { VariableDescriptor } from '../../core/types/variable';

export const LittleFilters = t.record(t.string, t.array(Filter));
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type LittleFilters = t.TypeOf<typeof LittleFilters>;

// convenience function concatenate desired little filters
function pickLittleFilters(
  littleFilters: LittleFilters | undefined,
  keys: string[]
): Filter[] {
  return keys.reduce<Filter[]>((accumulator, currentKey) => {
    const currentArray = littleFilters?.[currentKey];
    if (currentArray) {
      return accumulator.concat(currentArray);
    }
    return accumulator;
  }, []);
}

// hook to do basic picking and concatenation of filters and little filters
interface useLittleFiltersProps {
  filters: Filter[] | undefined;
  littleFilters: LittleFilters | undefined;
  filterTypes: string[];
}

export function useLittleFilters(props: useLittleFiltersProps) {
  const littleFilters = useDeepValue(
    pickLittleFilters(props.littleFilters, props.filterTypes)
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

// hook to return function that creates a little filter that performs the 'has value'
// functionality that it would be nice to have on the back end
//
// if you pass `filters` then the filters will be applied to the study metadata
// in 'filter-sensitive' mode (e.g. affecting the vocabulary or range)
export function useLittleFiltersForVariable(
  filters?: Filter[]
): (variableDescriptor: VariableDescriptor) => Filter[] {
  const findEntityAndVariable = useFindEntityAndVariable(filters);

  return useCallback(
    (variableDescriptor: VariableDescriptor) => {
      const { variable } = findEntityAndVariable(variableDescriptor) ?? {};
      if (variable != null) {
        if (
          variable.dataShape === 'categorical' &&
          variable.vocabulary != null
        ) {
          return [
            {
              type: 'stringSet' as const,
              ...variableDescriptor,
              stringSet: variable.vocabulary,
            },
          ];
        } else if (variable.type === 'number') {
          return [
            {
              type: 'numberRange' as const,
              ...variableDescriptor,
              min: variable.distributionDefaults.rangeMin,
              max: variable.distributionDefaults.rangeMax, // TO DO: check we use this, not display ranges
            },
          ];
        } else if (variable.type === 'date') {
          return [
            {
              type: 'dateRange' as const,
              ...variableDescriptor,
              min: variable.distributionDefaults.rangeMin + 'T00:00:00Z',
              max: variable.distributionDefaults.rangeMax + 'T00:00:00Z',
              // TO DO: check we use this, not display ranges
            },
          ];
        } else {
          throw new Error('unknown variable type or missing vocabulary');
        }
      }
      return [];
    },
    [findEntityAndVariable]
  );
}
