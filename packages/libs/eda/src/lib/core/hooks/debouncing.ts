import { debounce } from 'lodash';
import { useEffect, useRef, useState } from 'react';

// Courtesy of https://usehooks.com/useDebounce/
export function useDebounce<T>(value: T, delay: number) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );
  return debouncedValue;
}

/**
 * Returns a stable function that calls the input function after `delayMs` time in milliseconds.
 * If the returned function is called multiple times with the `delayMs` time window, previoius
 * calls will be cancelled. Furthermore, when the component is unmounted, any queued function
 * calls will be cancelled.
 *
 * Note that this hook does not require any dependencies, and does not support cancellation
 * based on dependency values changing.
 */
export function useDebouncedCallback<T extends any[]>(
  fn: (...args: T) => void,
  delayMs: number
) {
  // TODO Consider supporting cancellation based on dependency values changing.
  // This could be done using a "queryKey", similar to `useQuery`.
  // We would need a good use case for this behavior, before implementing.
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const debouncedFn = useRef(
    debounce(function (...args: T) {
      fnRef.current(...args);
    }, delayMs)
  ).current;

  useEffect(() => {
    return function cancel() {
      debouncedFn.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return debouncedFn;
}
