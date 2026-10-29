import * as util from './types';
import { isEmpty } from 'lodash';

export function ifDefined<T, R>(
  value: T | undefined,
  fn: util.Function<T, R>
): R | undefined {
  return value === undefined ? undefined : fn(value);
}

export function ifNotEmpty<T, R>(arr: Array<T>, fn: util.Function<T[], R>): util.Possible<R>;
export function ifNotEmpty<T extends object, R>(obj: T, fn: util.Function<T, R>): util.Possible<R>;
export function ifNotEmpty<R>(thing: any, fn: util.Function<any, R>): util.Possible<R> {
  return isEmpty(thing) ? undefined : fn(thing);
}

export function takeIf<T>(value: T, fn: util.Predicate<T>): util.Possible<T> {
  return fn(value) ? value : undefined;
}

export function requireValue<T>(
  value: util.Possible<T>,
  error: util.Producer<Error> = defaultRequireError
): NonNullable<T> {
  if (value == null) {
    throw error();
  }

  return value;
}

function defaultRequireError(): Error {
  return new Error('illegal state: required value was null or undefined');
}
