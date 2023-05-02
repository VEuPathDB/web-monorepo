import { Filter } from '../types/filter';

export function getFilterSet(filter?: Filter): number[] | string[] | undefined {
  switch (filter?.type) {
    case 'dateSet':
      return filter.dateSet;
    case 'numberSet':
      return filter.numberSet;
    case 'stringSet':
      return filter.stringSet;
  }
}
