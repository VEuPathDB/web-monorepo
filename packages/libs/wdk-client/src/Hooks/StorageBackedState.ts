import { useCallback, useState } from 'react';

export type Encoder<T> = (t: T) => string;
export type Parser<T> = (s: string) => T;

export function useStorageBackedState<T>(
  storage: Storage,
  defaultValue: T,
  key: string,
  encode: Encoder<T>,
  parse: Parser<T>
): [T, (newState: T) => void] {
  let initialValue = defaultValue;

  try {
    const storedStringValue = storage.getItem(key);

    if (storedStringValue !== null) {
      initialValue = parse(storedStringValue);
    }
  } catch (e) {
    console.warn(
      `Failed attempt to retrieve state value at storage key "${key}": "${e}"; falling back to component state`
    );
  }

  const [state, setState] = useState(initialValue);

  const setStorageBackedState = useCallback(
    (newValue: T) => {
      try {
        storage.setItem(key, encode(newValue));
      } catch {
        console.warn(
          `Failed attempt to persist state value storage key "${key}"; falling back to component state`
        );
      }
      setState(newValue);
    },
    [encode]
  );

  return [state, setStorageBackedState];
}
