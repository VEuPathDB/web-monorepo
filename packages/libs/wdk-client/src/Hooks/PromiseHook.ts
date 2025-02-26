import { useEffect, useState } from 'react';

interface PromiseFactoryProps {
  signal: AbortSignal;
}
interface PromiseFactory<T> {
  (props: PromiseFactoryProps): Promise<T>;
}

/**
 * Accepts a function that returns a Promise.
 * Returns `undefined` or the settled value of the Promise.
 * If the provided function does not handle Promise rejection, it will be lost.
 */
export function usePromise<T>(factory: PromiseFactory<T>, deps?: any[]) {
  const [value, setValue] = useState<T>();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let doSetValue = true;
    const controller = new AbortController();
    const props = { signal: controller.signal };
    setLoading(true);
    // Pass AbortSignal to factory function so it can handle
    // abort, if it so chooses.
    factory(props).then((value) => {
      if (doSetValue) {
        setValue(value);
        setLoading(false);
      }
    });
    return () => {
      doSetValue = false;
      controller.abort();
    };
  }, deps);
  return { value, loading };
}
