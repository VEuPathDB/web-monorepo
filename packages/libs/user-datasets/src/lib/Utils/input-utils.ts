import { ArrayElement, BiConsumer, Consumer } from './types';
import React, { ChangeEvent } from 'react';
import { isEmpty } from 'lodash';

export function changeHandler<
  T extends object,
  K extends keyof T = keyof T,
  V extends T[K] = T[K]
>(field: K, obj: T, then: Consumer<T>): Consumer<V> {
  return (value) => then({ ...obj, [field]: value });
}

export function useChangeHandler<
  T extends object,
  K extends keyof T = keyof T,
  V extends T[K] = T[K]
>(
  field: K,
  obj: T,
  then: Consumer<T>,
  deps: ReadonlyArray<unknown> = [],
): Consumer<V> {
  return React.useCallback(
    (value) => then({ ...obj, [field]: value }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...deps, then, obj, field],
  );
}

/**
 * Creates a callback to update React state for an object of type `T` containing
 * an array property `K` with array values of type `V` by adding or replacing
 * array values.
 *
 * This function does not mutate the input, it instead calls the provided React
 * state setter function with a new object and array constructed from the inputs
 * at callback execution time.
 *
 * @param field Name of the parent object property the change handler is to
 * update.
 *
 * @param obj Parent object instance that will be
 *
 * @param then React state setter function that will be invoked by the returned
 * callback after the new, updated state value has been constructed.
 *
 * @return A callback that may be used to replace the value at a given index in
 * the array at `K`, or add a new value at the end of that array.
 */
export function arrayChangeHandler<
  T extends object,
  K extends keyof T = keyof T,
  V extends ArrayElement<T[K] & never[]> = ArrayElement<T[K] & never[]>
>(field: K, obj: T, then: Consumer<T>): BiConsumer<V, number | undefined> {
  return (value, index) =>
    then({
      ...obj,
      [field]:
        typeof index === 'number'
          ? replaceElement(obj[field] as V[], index, value)
          : [...((obj[field] as V[]) ?? []), value],
    });
}

export function useArrayChangeHandler<
  T extends object,
  K extends keyof T = keyof T,
  V extends ArrayElement<T[K] & never[]> = ArrayElement<T[K] & never[]>
>(field: K, obj: T, then: Consumer<T>, deps: Array<unknown> = []): BiConsumer<V, number | undefined> {
  return React.useCallback(
    (value, index) =>
      then({
        ...obj,
        [field]:
          typeof index === 'number'
            ? replaceElement(obj[field] as V[], index, value)
            : [...((obj[field] as V[]) ?? []), value],
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...deps, field, obj, then],
  )
}

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
