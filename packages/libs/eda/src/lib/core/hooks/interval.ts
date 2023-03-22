import { useEffect, useRef } from 'react';

/**
 * Executes `callback` repeatedly, based on `intervalTimeMs`.
 * The interval is cleared only when the parent component is unmounted, or when
 * `intervalTimeMs` changes. Changes to `callback` do not clear the interval.
 */
export function useInterval(
  callback: () => void,
  intervalTimeMs: number
): void {
  // Use a ref for the callback so that new callbacks don't cause the interval
  // to be cleared.
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const id = setInterval(handler, intervalTimeMs);

    function handler() {
      callbackRef.current();
    }

    return function cancel() {
      clearInterval(id);
    };
  }, [intervalTimeMs]);
}
