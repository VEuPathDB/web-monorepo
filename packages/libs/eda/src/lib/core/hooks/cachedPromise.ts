import { useQuery } from '@tanstack/react-query';
import { PromiseHookState } from './promise';
import { useContext, useMemo } from 'react';
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
  queryKey: [any, ...any[]],
  cacheTime?: number
): PromiseHookState<T> {
  const enabled = queryKey.every((val) => val != null);

  // Requests that reference a derived variable must be re-keyed when its
  // spec is edited. Unreferenced requests keep exactly the same key.
  const specs = useContext(DerivedVariableSpecsContext);
  const referenced = enabled ? findReferencedSpecs(queryKey, specs) : [];

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: [
      'useCachedPromise',
      ...(queryKey ?? []),
      ...(referenced.length > 0 ? [referenced] : []),
    ],
    queryFn: task,
    enabled,
    keepPreviousData: enabled,
    ...(cacheTime != null ? { cacheTime } : {}),
  });

  // Mapping the state from useQuery to PromiseHookState<T>
  // and return something stable
  const isPending = isLoading || isFetching;
  const state: PromiseHookState<T> = useMemo(
    () => ({
      value: enabled ? data : undefined,
      pending: enabled && isPending,
      error: error,
    }),
    [data, enabled, isPending, error]
  );

  return state;
}
