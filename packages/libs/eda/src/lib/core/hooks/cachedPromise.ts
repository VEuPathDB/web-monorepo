import { useQuery } from '@tanstack/react-query';
import { PromiseHookState } from './promise';

// This is a wrapper around `useQuery` to replace our `usePromise` hook.
// This will provide full client-side cacheing (cache size > 1!)
// It is not quite a drop-in replacement as the caching uses serialisable keys.
//

// Note: the task may not return undefined.
// The task will not be executed while all items in the queryKey array are nullish
// (empty queryKey array not allowed)
export function useCachedPromise<T>(
  task: () => Promise<T>,
  queryKey: [any, ...any[]]
): PromiseHookState<T> {
  // Using useQuery from react-query with the unique key
  const { data, error, isLoading } = useQuery({
    queryKey: ['useCachedPromise', ...(queryKey ?? [])],
    queryFn: task,
    enabled: queryKey.every((val) => val != null),
  });

  // Mapping the state from useQuery to PromiseHookState<T>
  const state: PromiseHookState<T> = {
    value: data,
    pending: isLoading,
    error: error,
  };

  return state;
}
