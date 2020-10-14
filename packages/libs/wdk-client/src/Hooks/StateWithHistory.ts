import { useState, useCallback } from 'react';

export interface Options {
  size: number;
}

export function useStateWithHistory<T>(initialState: T, options: Options) {
  // history is a stack, so newest state is at head
  const [historyState, setState] = useState({
    cursor: 0,
    history: [initialState]
  });
  // cursor is the current position of the stack
  const canUndo = historyState.cursor < historyState.history.length - 1;
  const canRedo = historyState.cursor > 0;

  const set = useCallback((value: T) => {
    setState(s => ({
      cursor: 0,
      history: [value, ...s.history.slice(s.cursor, options.size - 1)]
    }))
  }, [options.size]);

  const undo = useCallback(() => {
    setState(s => s.cursor === s.history.length - 1 ? s : {
      ...s,
      cursor: s.cursor + 1
    })
  }, []);

  const redo = useCallback(() => {
    setState(s => s.cursor === 0 ? s : {
      ...s,
      cursor: s.cursor - 1
    })
  }, []);

  return {
    state: historyState.history[historyState.cursor],
    canUndo,
    canRedo,
    set,
    undo,
    redo
  }
}