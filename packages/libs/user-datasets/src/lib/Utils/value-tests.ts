import lodash from 'lodash';
import { Optional } from './types';

export function isNonEmpty<T extends string | Array<any> | object>(
  value: any
): value is T {
  return !lodash.isEmpty(value);
}

export function isNonEmptyString(value: Optional<any>): value is string {
  return typeof value === 'string' && value.length > 0;
}

export const isNonBlank = (value: Optional<string>): value is string =>
  typeof value === 'string' && /\S/.test(value);

export const isBlank = (value: Optional<string>) =>
  value == null || !/\S/.test(value);

export function filterNullish<T>(values: Readonly<Array<Optional<T>>>): Array<T> {
  const out: Array<T> = [];

  for (const value of values) {
    if (value !== null && value !== undefined)
      out.push(value);
  }

  return out;
}