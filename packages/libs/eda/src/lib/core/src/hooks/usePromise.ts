import { useCallback, useEffect, useState } from "react";

export type PromiseHookState<T> = {
  value?: T;
  pending: boolean;
  error?: unknown;
}

export function usePromise<T>(promiseFactory: () => Promise<T>, deps?: unknown[]): PromiseHookState<T> {
  const [state, setState] = useState<PromiseHookState<T>>({
    pending: true,
  });
  const callback = deps ? useCallback(promiseFactory, deps) : promiseFactory;
  useEffect(() => {
    let ignoreResolve = false;
    setState({ pending: true });
    callback().then(
      value => {
        if (ignoreResolve) return;
        setState({
          value,
          pending: false,
        });
      },
      error => {
        if (ignoreResolve) return;
        setState({
          error,
          pending: false
        });
      })
    return function cleanup() {
      ignoreResolve = true;
    }
  }, [callback]);
  return state;
}
