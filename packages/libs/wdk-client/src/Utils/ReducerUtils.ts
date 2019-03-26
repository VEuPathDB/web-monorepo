import { Reducer, Action } from 'redux';

export type IndexedState<State> = {
  [K in string]?: State;
};

type IndexedReducer<State> = Reducer<IndexedState<State>>;

/**
 * Enhances a reducer by return a parent state object that is keyed by an index
 * value. Actions are delegated to the provided reducer, using the return value
 * of `getIndexValue(action)` as the index value. If `getIndexValue(action)`
 * returns `undefined`, the reducer will be called with it and all substates.
 */
export function indexByActionProperty<State>(
  reducer: Reducer<State>,
  getIndexValue: (action: Action) => string | undefined
): IndexedReducer<State> {
  return function(state: IndexedState<State> = {}, action: Action) {
    const index = getIndexValue(action);
    const indexes = index ? [ index ] : Object.keys(state);
    const nextState = { ...state };
    let stateDidChange = false;
    for (const index of indexes) {
      const currentSubstate = state[index];
      const nextSubstate = reducer(currentSubstate, action);
      if (currentSubstate !== nextSubstate) stateDidChange = true;
      nextState[index] = nextSubstate;
    }
    return stateDidChange ? nextState : state;
  }
}
