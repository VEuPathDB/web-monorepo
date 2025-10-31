/**
 * Transforms the given value of type `T` into a value of type `R` using the
 * given mapping function.
 *
 * @param value Original value to transform.
 * @param fn Mapping function used to transform the input value into a value
 * of the output type.
 */
export const transform = function<T, R>(value: T, fn: (v: T) => R): R {
  return fn(value);
}

/**
 * Defines a function that consumes a given value and returns nothing.
 */
export type Consumer<T> = (value: T) => void;
