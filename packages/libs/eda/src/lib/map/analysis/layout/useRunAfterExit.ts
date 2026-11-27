import { useCallback, useRef } from 'react';

/**
 * Defers an action until a closing pop-over's exit transition has ended -
 * e.g. opening another pop-over, so that two are never on screen at once
 * and focus is handed back to the first one's button before the second
 * one opens. Pass `onExited` as the pop-over's `TransitionProps.onExited`.
 */
export function useRunAfterExit(): {
  schedule: (action: () => void) => void;
  onExited: () => void;
} {
  const pending = useRef<(() => void) | undefined>(undefined);
  const schedule = useCallback((action: () => void) => {
    pending.current = action;
  }, []);
  const onExited = useCallback(() => {
    const action = pending.current;
    pending.current = undefined;
    action?.();
  }, []);
  return { schedule, onExited };
}
