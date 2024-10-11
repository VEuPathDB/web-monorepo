import { useQuery } from '@tanstack/react-query';
import { PromiseHookState } from './promise';

export function useCachedPromise<T>(
  task: () => Promise<T>,
  queryKey: any[] | undefined
): PromiseHookState<T> {
  // Using useQuery from react-query with the unique key
  const { data, error, isLoading } = useQuery({
    queryKey: ['useCachedPromise', ...(queryKey ?? [])],
    queryFn: task,
  });

  // Mapping the state from useQuery to PromiseHookState<T>
  const state: PromiseHookState<T> = {
    value: data,
    pending: isLoading,
    error: error,
  };

  return state;
}
