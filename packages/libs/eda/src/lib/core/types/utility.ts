import DataClient from '../api/DataClient';
import {
  DateRangeFilter,
  DateSetFilter,
  NumberRangeFilter,
  NumberSetFilter,
  StringSetFilter,
} from './filter';
import { Variable } from './study';

// prettier-ignore
export type TypedFilter<T extends Variable> =

  // Continuous
  T['dataShape'] extends 'continuous' ? (
    T['type'] extends 'number' ? NumberRangeFilter
    : T['type'] extends 'date' ? DateRangeFilter
    : never
  ) :

  // Categorical-ish
  T['dataShape'] extends ('categorical' | 'ordinal' | 'binary') ? (
    T['type'] extends 'string' ? StringSetFilter
    : T['type'] extends 'number' ? NumberSetFilter
    : T['type'] extends 'date' ? DateSetFilter
    : never
  ) :

  // Everything else we don't support
  never;

export type PromiseType<T extends Promise<any>> = T extends Promise<infer R>
  ? R
  : never;

export type Dist<T extends keyof DataClient> = {
  foreground: PromiseType<ReturnType<DataClient[T]>>;
  background: PromiseType<ReturnType<DataClient[T]>>;
};
