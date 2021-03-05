import { useCallback, useEffect, useState } from 'react';
import { stubFalse } from 'lodash/fp';

export type PromiseHookState<T> = {
  value?: T;
  pending: boolean;
  error?: unknown;
};

export function usePromise<T>(
  promiseFactory: () => Promise<T>,
  deps?: unknown[]
): PromiseHookState<T>;
export function usePromise<T>(
  promiseFactory: () => Promise<T>,
  retainPreviousValue: (prevState?: T) => boolean,
  deps?: unknown[]
): PromiseHookState<T>;
export function usePromise<T>(
  promiseFactory: () => Promise<T>,
  retainPreviousValueOrDeps?: unknown[] | ((preState?: T) => boolean),
  optionalDeps?: unknown[]
): PromiseHookState<T> {
  const [state, setState] = useState<PromiseHookState<T>>({
    pending: true,
  });
  const deps = Array.isArray(retainPreviousValueOrDeps)
    ? retainPreviousValueOrDeps
    : optionalDeps;
  const retainPreviousValue =
    typeof retainPreviousValueOrDeps === 'function'
      ? retainPreviousValueOrDeps
      : stubFalse;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callback = useCallback(promiseFactory, deps ?? [promiseFactory]);
  useEffect(() => {
    let ignoreResolve = false;
    setState((prev) => ({
      pending: true,
      value: retainPreviousValue(prev.value) ? prev.value : undefined,
      error: undefined,
    }));
    callback().then(
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
  }, [callback, retainPreviousValue]);
  return state;
}
