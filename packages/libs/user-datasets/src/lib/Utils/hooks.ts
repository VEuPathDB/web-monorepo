import { Runnable, Thruple } from './types';
import { useState } from 'react';

/**
 * Wrapper around React's `useState` for boolean values that returns separate
 * `true`/`false` setters in place of the singular boolean consumer function.
 *
 * @param initial Initial toggle value, defaults to `false`.
 *
 * @return `[state, setTrue, setFalse]`
 */
export const useToggle = (initial: boolean = false): Thruple<boolean, Runnable, Runnable> => {
  const [state, setState] = useState(initial);
  return [
    state,
    () => setState(true),
    () => setState(false),
  ];
};