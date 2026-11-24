import Lodash from 'lodash';
import { Optional } from './types';

export const isNonEmpty = <T extends string | Array<any> | object>(value: any): value is T =>
  !Lodash.isEmpty(value);

export const isNonEmptyString = (value: Optional<any>): value is string =>
  typeof value === 'string' && value.length > 0;

export const isNonBlank = (value: Optional<string>): value is string =>
  typeof value === 'string' && /\S/.test(value);

export const isBlank = (value: Optional<string>) =>
  value == null || !/\S/.test(value);

export const filterNullish = <T>(values: ReadonlyArray<Optional<T>>): Array<T> => {
  const out: Array<T> = [];

  for (const value of values) {
    if (value !== null && value !== undefined)
      out.push(value);
  }

  return out;
}