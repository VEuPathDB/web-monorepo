import { SetStateAction } from "react";

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

export const ifExists = function<T, R>(value: T | undefined | null, fn: (it: T) => R): R | undefined {
  return value == null ? undefined : fn(value);
}

/**
 * Defines a function that consumes a given value and returns nothing.
 */
export type Consumer<T> = (value: T) => void;

export const doNothing = () => null;

export const resolveNewState = function<T>(newState: SetStateAction<T>, oldState: T): T {
  if (typeof newState === 'function')
    return (newState as Function)(oldState);
  return newState;
}

export const sanitizeFilename = (name: string | File): string =>
  (name instanceof File ? name.name : name).replace(/\s+/g, "_")

export const TODO = (msg: string) => { throw new Error(`TODO: ${msg}`); }