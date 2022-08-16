import { isEqual } from 'lodash';
import { useState } from 'react';

/**
 * If a previous value and next value have recursively equal "own" properties,
 * then the previous value will be returned. This allows operations like
 * `Array.prototype.filter` to be used in an immutability context.
 * @param value Some value
 * @returns Referentially stable value
 */
export function useDeepValue<T>(value: T) {
  const [state, setState] = useState(value);
  if (!isEqual(value, state)) setState(value);
  return state;
}
