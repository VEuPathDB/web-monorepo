import { useEffect, useState } from 'react';

export type PromiseHookState<T> = {
  value?: T;
  pending: boolean;
  error?: unknown;
};

/**
 * Invokes `task` and returns an object representing its current state and resolved value.
 * The last resolved value will remain util a new promise is resolved.
 * Note that `usePromise` will invoke `task` any time it detects a new function. Consider using
 * `useCallback` to prevent excessive executions.
 *
 * @param task A function that returns a promise
 * @returns PromiseHookState<T>
 */
export function usePromise<T>(task: () => Promise<T>): PromiseHookState<T> {
  const [state, setState] = useState<PromiseHookState<T>>({
    pending: true,
  });
  useEffect(() => {
    let ignoreResolve = false;
    setState((prev) => ({
      pending: true,
      value: prev.value,
      error: undefined,
    }));
    task().then(
      (value) => {
        if (ignoreResolve) return;
        setState({
          value,
          pending: false,
        });
      },
      (error) => {
        if (ignoreResolve) return;
        setState({
          error,
          pending: false,
        });
      }
    );
    return function cleanup() {
      ignoreResolve = true;
    };
  }, [task]);
  return state;
}
