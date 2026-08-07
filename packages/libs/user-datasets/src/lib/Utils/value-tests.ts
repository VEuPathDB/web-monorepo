import lodash from 'lodash';
import { Optional } from './types';

// export function isNonEmpty<T extends object>(value: Optional<T>): value is T;
export function isNonEmpty<T extends string | Array<any> | object>(
  value: any
): value is T {
  return !lodash.isEmpty(value);
}

export function isNonEmptyString(value: Optional<any>): value is string {
  return typeof value === 'string' && value.length > 0;
}

export function isNonBlankString(value: Optional<any>): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
