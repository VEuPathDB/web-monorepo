import * as util from './types';

export function ifDefined<T, R>(
  value: T | undefined,
  fn: util.Function<T, R>
): R | undefined {
  console.log('runIfDefined', value);
  return value === undefined ? undefined : fn(value);
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
