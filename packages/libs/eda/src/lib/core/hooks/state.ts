import { useRef } from 'react';

/**
 * Calls the `updater` function when `value` changes.
 */
export function useValueBasedUpdater<T>(value: T, updater: () => void) {
  const ref = useRef<T>();
  if (ref.current !== value) {
    updater();
  }
  ref.current = value;
}
