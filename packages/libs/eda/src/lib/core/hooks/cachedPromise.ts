import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useQuery } from 'react-query';
import { PromiseHookState } from './promise';

export function useCachedPromise<T>(
  task: () => Promise<T>,
  deps: any[]
): PromiseHookState<T> {
  // generate a serialisable key for react-query from a mix of data and class/function dependencies
  const uniqueKey = useMemo(() => uuidv4(), deps);
  // Using useQuery from react-query with the unique key
  const { data, error, isLoading } = useQuery({
    queryKey: ['useCachedPromise', uniqueKey],
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
