import { Nullable, Optional, Possible } from './types';

export function reduceTo<T, I>(values: Iterable<I>, init: T, fn: (next: I, sum: T, index: number) => T): T {
  let i = 0;
  let current = init;

  for (const value of values) {
    current = fn(value, init, i++);
  }

  return current;
}

export function toFileArray(list: FileList): Array<Nullable<File>> {
  const out = new Array<File>(list.length)

  for (let i = 0; i < list.length; i++)
    out[i] = list.item(i)!!;

  return out;
}

export function filterNullish<T>(values: Readonly<Array<Optional<T>>>): Array<T> {
  const out: Array<T> = [];

  for (const value of values) {
    if (value !== null && value !== undefined)
      out.push(value);
  }

  return out;
}