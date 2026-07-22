import * as util from './types';
import { Producer } from './types';

export function runIfDefined<T, R>(
  value: T | undefined,
  fn: util.Function<T, R>
): R | undefined {
  return value === undefined ? undefined : fn(value);
}

export function require<T>(
  value: T | null | undefined,
  error: Producer<Error>
): T {
  if (value == null) throw error();

  return value;
}
