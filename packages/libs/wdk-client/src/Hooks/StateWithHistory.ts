import { useState, useCallback } from 'react';

export interface Options {
  size: number;
}

type NextState<T> = T | ((nextState: T) => T);

interface Return<T> {
  state: T,
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  set: (nextState: NextState<T>) => void;
}

/**
 * Use state hook with a history of the size provided via `options`. The initial returned state will be `undefined`.
 * @param options 
 */
export function useStateWithHistory<T = undefined>(options: Options): Return<T | undefined>;
/**
 * Use state hook with a history of the size provided via `options`.
 * @param options 
 */
export function useStateWithHistory<T>(initialState: T, options: Options): Return<T>;
export function useStateWithHistory<T>(initialStateOrOptions: T | Options, optionsOrUndef?: Options) {
  // If `optionsOrUndef` is undefined, then the first function signature is in
  // use, otherwise the second is in use.
  const options: Options = optionsOrUndef == null ? initialStateOrOptions as Options : optionsOrUndef;
  const initialState: T | undefined = optionsOrUndef == null ? undefined: initialStateOrOptions as T;
  // historyState.stack is a stack, so newest state is at head
  // historyState.cursor is the current position of the stack
  const [historyState, setHistoryState] = useState({
    cursor: 0,
    stack: initialState == null ? [] : [initialState]
  });
  const canUndo = historyState.cursor < historyState.stack.length - 1;
  const canRedo = historyState.cursor > 0;

  const set = useCallback((nextState: NextState<T>) => {
    setHistoryState(s => ({
      cursor: 0,
      stack: [
        nextState instanceof Function ? nextState(s.stack[s.cursor]) : nextState,
        ...s.stack.slice(s.cursor, options.size - 1)
      ]
    }))
  }, [options.size]);

  const undo = useCallback(() => {
    setHistoryState(s => s.cursor === s.stack.length - 1 ? s : {
      ...s,
      cursor: s.cursor + 1
    })
  }, []);

  const redo = useCallback(() => {
    setHistoryState(s => s.cursor === 0 ? s : {
      ...s,
      cursor: s.cursor - 1
    })
  }, []);

  return {
    state: historyState.stack[historyState.cursor],
    canUndo,
    canRedo,
    set,
    undo,
    redo
  }
}