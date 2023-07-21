import { Encoder, Parser, useStorageBackedState } from './StorageBackedState';

export function useLocalBackedState<T>(
  defaultValue: T,
  key: string,
  encode: Encoder<T>,
  parse: Parser<T>
) {
  return useStorageBackedState(
    window.localStorage,
    defaultValue,
    key,
    encode,
    parse
  );
}
