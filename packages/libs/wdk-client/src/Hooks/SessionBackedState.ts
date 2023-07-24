import { Encoder, Parser, useStorageBackedState } from './StorageBackedState';

export function useSessionBackedState<T>(
  defaultValue: T,
  key: string,
  encode: Encoder<T>,
  parse: Parser<T>
) {
  return useStorageBackedState(
    window.sessionStorage,
    defaultValue,
    key,
    encode,
    parse
  );
}
