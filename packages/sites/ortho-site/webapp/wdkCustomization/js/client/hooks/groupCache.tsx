import React, {
  createContext,
  Fragment,
  ReactNode,
  useDeferredValue,
  useEffect,
  useState,
} from 'react';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { useSessionBackedState } from '@veupathdb/wdk-client/lib/Hooks/SessionBackedState';
import {
  Encoder,
  Parser,
} from '@veupathdb/wdk-client/lib/Hooks/StorageBackedState';
import { discardStaleGroupCache, groupCacheKey } from '../util/groupCache';

/** The group whose cache has been checked; only set inside a GroupCacheGate. */
const GroupCacheContext = createContext<string | undefined>(undefined);
GroupCacheContext.displayName = 'GroupCache';

/**
 * Renders `children` only once the group's cached page state has been checked
 * (see discardStaleGroupCache), and gives them the group-backed state hooks
 * below. Cached state is only valid for the service run that wrote it, so the
 * check has to finish before anything reads it.
 */
export function GroupCacheGate({
  group,
  children,
}: {
  group: string;
  children: ReactNode;
}) {
  const { wdkService } = useNonNullableContext(WdkDependenciesContext);
  const [checkedGroup, setCheckedGroup] = useState<string>();
  const [failure, setFailure] = useState<{ error: unknown }>();

  useEffect(() => {
    let cancelled = false;
    wdkService.getVersion().then(
      (version) => {
        if (cancelled) return;
        discardStaleGroupCache(version, group);
        setCheckedGroup(group);
      },
      (error) => {
        if (!cancelled) setFailure({ error });
      }
    );
    return () => {
      cancelled = true;
    };
  }, [wdkService, group]);

  // Without the service version the cache can't be trusted, and the page
  // can't be either; hand the error to the nearest error boundary.
  if (failure) throw failure.error;

  if (checkedGroup !== group) return <Loading />;

  // WDK reuses the record page when navigating between groups; the key gives
  // each group its own state, filters and trees included.
  return (
    <GroupCacheContext.Provider value={group}>
      <Fragment key={group}>{children}</Fragment>
    </GroupCacheContext.Provider>
  );
}

/** Session-backed state for one group's page. Only usable inside a GroupCacheGate. */
export function useGroupBackedState<T>(
  name: string,
  defaultValue: T,
  encode: Encoder<T>,
  decode: Parser<T>
) {
  const group = useNonNullableContext(GroupCacheContext);
  return useSessionBackedState(
    defaultValue,
    groupCacheKey(group, name),
    encode,
    decode
  );
}

/**
 * Like useGroupBackedState, but deferred like `useDeferredState` from coreui:
 * returns the deferred value, the setter and the immediate value. Filter
 * controls bound to the immediate value respond at once while the table
 * re-filters in the background; on groups of tens of thousands of proteins
 * that takes seconds.
 */
export function useGroupBackedDeferredState<T>(
  name: string,
  defaultValue: T,
  encode: Encoder<T>,
  decode: Parser<T>
): [T, (value: T) => void, T] {
  const [volatile, setValue] = useGroupBackedState(
    name,
    defaultValue,
    encode,
    decode
  );
  return [useDeferredValue(volatile), setValue, volatile];
}
