import { useRef } from 'react';

/**
 * The value, or - while it is undefined (e.g. a count being refetched) - the
 * last value that was defined, so the display keeps its width and nothing
 * around it reflows.
 */
export function useLatestDefined<T>(value: T | undefined): T | undefined {
  const latest = useRef(value);
  if (value !== undefined) latest.current = value;
  return latest.current;
}
