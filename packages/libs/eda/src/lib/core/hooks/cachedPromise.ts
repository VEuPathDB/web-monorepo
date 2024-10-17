import { useQuery } from '@tanstack/react-query';
import { PromiseHookState } from './promise';
import { useMemo } from 'react';

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
export function useCachedPromise<T>(
  task: () => Promise<T>,
  queryKey: [any, ...any[]]
): PromiseHookState<T> {
  const enabled = queryKey.every((val) => val != null);

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ['useCachedPromise', ...(queryKey ?? [])],
    queryFn: task,
    enabled,
    keepPreviousData: enabled,
  });

  // Mapping the state from useQuery to PromiseHookState<T>
  // and return something stable
  const state: PromiseHookState<T> = useMemo(
    () => ({
      value: enabled ? data : undefined,
      pending: enabled && (isLoading || isFetching),
      error: error,
    }),
    [data, enabled, isLoading || isFetching, error]
  );

  return state;
}
