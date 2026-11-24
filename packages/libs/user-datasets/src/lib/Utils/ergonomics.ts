import { isEmpty } from 'lodash';
import { Func, Possible, Predicate, Producer } from './types';

export function ifDefined<T, R>(value: Possible<T>, fn: Func<T, R>): Possible<R>;
export function ifDefined<T, R>(value: Possible<T>, fn: Func<T, R>, fallback: R): R;
export function ifDefined<T, R>(
  value: Possible<T>,
  fn: Func<T, R>,
  fallback?: R,
): R | undefined {
  return value === undefined ? fallback : fn(value);
}

export function ifNotEmpty<T, R>(arr: ReadonlyArray<T>, fn: Func<T[], R>): Possible<R>;
export function ifNotEmpty<T extends object, R>(obj: T, fn: Func<T, R>): Possible<R>;
export function ifNotEmpty<R>(thing: any, fn: Func<any, R>): Possible<R> {
  return isEmpty(thing) ? undefined : fn(thing);
}

export function takeIf<T>(value: T, fn: Predicate<T>): Possible<T> {
  return fn(value) ? value : undefined;
}

export const requireValue = <T>(
  value: Possible<T>,
  error: Producer<Error> = defaultRequireError
): NonNullable<T> => {
  if (value == null) {
    throw error();
  }

  return value;
}

const defaultRequireError = (): Error =>
  new Error('illegal state: required value was null or undefined');

export const using = <T, R>(value: T, fn: Func<T, R>): R => fn(value);
