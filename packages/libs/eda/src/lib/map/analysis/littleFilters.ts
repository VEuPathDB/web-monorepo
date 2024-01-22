import * as t from 'io-ts';
import { useDeepValue } from '../../core/hooks/immutability';
import { Filter } from '../../core';
import { useMemo } from 'react';

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
