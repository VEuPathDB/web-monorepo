import { useQueries, useQuery } from '@tanstack/react-query';
import { PromiseHookState } from './promise';
import { useContext, useMemo } from 'react';
import { DerivedVariableSpec } from '../types/analysis';
import { DerivedVariableSpecsContext } from '../derivedVariables/DerivedVariableSpecsContext';
import { findReferencedSpecs } from '../derivedVariables/references';

// This is a wrapper around `useQuery` to replace our `usePromise` hook.
//
// It provides full client-side cacheing (cache size > 1!)
// It is not quite a drop-in replacement as the caching uses serialisable keys.
// But on the plus side, it's not necessary to memoize the task function.
//
// The task will not be executed while all items in the queryKey array are nullish
// (empty queryKey array not allowed)
//
// Note: the task may not return undefined, but the hook will return `value: undefined`
// when disabled.
//
// cacheTime is optional and in milliseconds - default from react-query is 5 minutes
//
export function useCachedPromise<T>(
  task: () => Promise<T>,
  queryKey: readonly [unknown, ...unknown[]],
  cacheTime?: number
): PromiseHookState<T> {
  const specs = useContext(DerivedVariableSpecsContext);
  const enabled = isEnabled(queryKey);

  const { data, error, isLoading, isFetching } = useQuery({
    ...baseQueryOptions(task, queryKey, specs, cacheTime),
    keepPreviousData: enabled,
  });

  // Mapping the state from useQuery to PromiseHookState<T>
  // and return something stable
  const isPending = isLoading || isFetching;
  const state: PromiseHookState<T> = useMemo(
    () => toPromiseHookState(enabled, data, isPending, error),
    [data, enabled, isPending, error]
  );

  return state;
}

/**
 * Like `useCachedPromise`, for a variable number of tasks. Returns one state
 * per entry, in entry order (`[]` for no entries). Keys share cache entries
 * with `useCachedPromise`.
 *
 * Difference from `useCachedPromise`: react-query 4's `useQueries` does not
 * support `keepPreviousData`, so an entry whose key changes shows
 * `value: undefined, pending: true` until its new data arrives.
 */
export function useCachedPromises<T>(
  entries: Array<{
    task: () => Promise<T>;
    queryKey: readonly [unknown, ...unknown[]];
  }>,
  cacheTime?: number
): PromiseHookState<T>[] {
  const specs = useContext(DerivedVariableSpecsContext);
  const results = useQueries({
    queries: entries.map(({ task, queryKey }) =>
      baseQueryOptions(task, queryKey, specs, cacheTime)
    ),
  });
  return results.map((result, i) =>
    toPromiseHookState(
      isEnabled(entries[i].queryKey),
      result.data,
      result.isLoading || result.isFetching,
      result.error
    )
  );
}

// The task is only run when every part of the key is non-null.
function isEnabled(queryKey: readonly unknown[]): boolean {
  return queryKey.every((val) => val != null);
}

function baseQueryOptions<T>(
  task: () => Promise<T>,
  queryKey: readonly [unknown, ...unknown[]],
  specs: DerivedVariableSpec[],
  cacheTime?: number
) {
  const enabled = isEnabled(queryKey);
  // Requests that reference a derived variable must be re-keyed when its
  // spec is edited. Unreferenced requests keep exactly the same key.
  const referenced =
    enabled && specs.length > 0 ? findReferencedSpecs(queryKey, specs) : [];
  return {
    queryKey: [
      'useCachedPromise',
      ...(queryKey ?? []),
      ...(referenced.length > 0 ? [referenced] : []),
    ],
    queryFn: task,
    enabled,
    ...(cacheTime != null ? { cacheTime } : {}),
  };
}

function toPromiseHookState<T>(
  enabled: boolean,
  data: T | undefined,
  isPending: boolean,
  error: unknown
): PromiseHookState<T> {
  return {
    value: enabled ? data : undefined,
    pending: enabled && isPending,
    error: error,
  };
}
