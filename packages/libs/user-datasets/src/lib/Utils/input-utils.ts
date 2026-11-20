import { Consumer } from './types';
import { ChangeEvent } from 'react';
import { isEmpty } from 'lodash';

export function textChange(
  fn: Consumer<string | undefined>
): Consumer<ChangeEvent<HTMLInputElement>> {
  return (e) => fn(e.currentTarget?.value);
}

export function replaceElement<T>(
  array: readonly T[] | undefined,
  index: number,
  value: T
): T[] {
  // If we didn't have an array before, or the array was empty.
  if (!Array.isArray(array) || isEmpty(array)) {
    return [value];
  }

  // If the index is after the current array indices
  if (index >= array.length) {
    return [...array, value];
  }

  // Else we are replacing something mid-array.
  const result = [...array];
  result[index] = value;
  return result;
}
