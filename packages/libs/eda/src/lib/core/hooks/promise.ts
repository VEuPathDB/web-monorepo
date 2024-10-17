import { useEffect, useState } from 'react';
import { useValueBasedUpdater } from './state';

export type PromiseHookState<T> = {
  value?: T;
  pending: boolean;
  error?: unknown;
};

export type PromiseHookOptions = {
  keepPreviousValue?: boolean;
  throwError?: boolean;
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
export function usePromise<T>(
  task: () => Promise<T>,
  options: PromiseHookOptions = {}
): PromiseHookState<T> {
  const { keepPreviousValue = true, throwError = false } = options;
  const [state, setState] = useState<PromiseHookState<T>>({
    pending: true,
  });

  // Set pending state synchronously
  useValueBasedUpdater(task, () => {
    setState((prev) => ({
      pending: true,
      value: keepPreviousValue ? prev.value : undefined,
      error: undefined,
    }));
  });

  useEffect(() => {
    let ignoreResolve = false;
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
  if (state.error && throwError) throw state.error;
  return state;
}
