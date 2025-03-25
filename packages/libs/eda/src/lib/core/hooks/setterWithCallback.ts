import React, { useCallback, useRef } from 'react';

/**
 * A lightweight hook that mimics React's `useState` setter, but also invokes a side-effect callback
 * after each update. It supports both direct value updates and functional updates.
 *
 * Unlike `useState`, this hook does not trigger a component re-render. It uses a ref to store
 * the current value and provides a setter function that:
 *   - Resolves functional updates like `(prev) => next`
 *   - Updates the internal ref
 *   - Calls the provided callback with the new value
 *
 * Useful when bridging between internal state and external effects such as persisting to storage,
 * syncing with URL parameters, or serializing to props — especially when passing the setter to
 * a hook or component that expects a function like `(update: T | ((prev: T) => T)) => void` to
 * handle state changes.
 *
 * Note: The returned setter should be the exclusive mechanism for updating the value.
 * If the value is also updated externally (e.g., via re-renders with a new `initialValue`),
 * those changes will not be reflected in this hook's internal state. This hook is intended for
 * cases where *all* updates flow through the returned setter function.
 *
 * @param initialValue - The initial value to store in the ref.
 * @param callback - A function called with the new value after each update.
 * @returns A setter function compatible with `React.SetStateAction<T>`.
 */

export function useSetterWithCallback<T>(
  initialValue: T,
  callback: (value: T) => void
) {
  const stateRef = useRef<T>(initialValue);
  const setter = useCallback(
    (update: React.SetStateAction<T>) => {
      if (typeof update === 'function') {
        // `update` is still typed as `((prevState: T) => T) | (T & Function)` here,
        // so we need to coerce it:
        const updater = update as (prevState: T) => T;
        stateRef.current = updater(stateRef.current);
      } else {
        stateRef.current = update;
      }
      callback(stateRef.current);
    },
    [callback]
  );

  return setter;
}
