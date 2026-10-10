import { useDeferredValue } from 'react';
import { useSessionBackedState } from '@veupathdb/wdk-client/lib/Hooks/SessionBackedState';
import { groupCacheKey } from '../util/groupCache';

/**
 * Session-backed state for one group's page, like `useDeferredState` from
 * coreui: returns the deferred value, the setter and the immediate value.
 * `decode` turns the stored string back into a value.
 */
export function useGroupBackedDeferredState<T>(
  group: string,
  name: string,
  defaultValue: T,
  encode: (value: T) => string,
  decode: (raw: string) => T
): [T, (value: T) => void, T] {
  const [volatile, setValue] = useSessionBackedState(
    defaultValue,
    groupCacheKey(group, name),
    encode,
    decode
  );
  return [useDeferredValue(volatile), setValue, volatile];
}
