import { Action, ActionType, TypedActionCreator } from './ActionCreatorUtils';

type AnonTA = TypedActionCreator<string, any>;

export type Reducer<T, S extends Action = Action> = (state: T|undefined, action: S) => T;

type Case<T, S extends AnonTA> = [S, (state: T, payload: ActionType<S>['payload']) => T ]

/**
 * Create a reducer which will find the first pair whose action predicate
 * returns `true` and return the result of the associated reducer. Otherwise,
 * `state` will be returns as-is.
 *
 * @param cases An array of tuples of action predicate and reducer
 */
export function matchAction<
  T,
  A extends AnonTA,
  >(initialState: T,
    caseA: Case<T, A>,
): Reducer<T, Action>;
export function matchAction<
  T,
  A extends AnonTA,
  B extends AnonTA,
  >(initialState: T,
    caseA: Case<T, A>,
    caseB: Case<T, B>,
): Reducer<T, Action>;
export function matchAction<
  T,
  A extends AnonTA,
  B extends AnonTA,
  C extends AnonTA,
  >(initialState: T,
    caseA: Case<T, A>,
    caseB: Case<T, B>,
    caseC: Case<T, C>,
): Reducer<T, Action>;
export function matchAction<
  T,
  A extends AnonTA,
  B extends AnonTA,
  C extends AnonTA,
  D extends AnonTA,
  >(initialState: T,
    caseA: Case<T, A>,
    caseB: Case<T, B>,
    caseC: Case<T, C>,
    caseD: Case<T, D>,
): Reducer<T, Action>;
export function matchAction<
  T,
  A extends AnonTA,
  B extends AnonTA,
  C extends AnonTA,
  D extends AnonTA,
  E extends AnonTA,
  >(initialState: T,
    caseA: Case<T, A>,
    caseB: Case<T, B>,
    caseC: Case<T, C>,
    caseD: Case<T, D>,
    caseE: Case<T, E>,
): Reducer<T, Action>;
export function matchAction<
  T,
  A extends AnonTA,
  B extends AnonTA,
  C extends AnonTA,
  D extends AnonTA,
  E extends AnonTA,
  F extends AnonTA,
  >(initialState: T,
    caseA: Case<T, A>,
    caseB: Case<T, B>,
    caseC: Case<T, C>,
    caseD: Case<T, D>,
    caseE: Case<T, E>,
    caseF: Case<T, F>,
): Reducer<T, Action>;
export function matchAction<
  T,
  A extends AnonTA,
  B extends AnonTA,
  C extends AnonTA,
  D extends AnonTA,
  E extends AnonTA,
  F extends AnonTA,
  G extends AnonTA,
  >(initialState: T,
    caseA: Case<T, A>,
    caseB: Case<T, B>,
    caseC: Case<T, C>,
    caseD: Case<T, D>,
    caseE: Case<T, E>,
    caseF: Case<T, F>,
    caseG: Case<T, G>,
): Reducer<T, Action>;
export function matchAction<
  T,
  A extends AnonTA,
  B extends AnonTA,
  C extends AnonTA,
  D extends AnonTA,
  E extends AnonTA,
  F extends AnonTA,
  G extends AnonTA,
  H extends AnonTA,
  >(initialState: T,
    caseA: Case<T, A>,
    caseB: Case<T, B>,
    caseC: Case<T, C>,
    caseD: Case<T, D>,
    caseE: Case<T, E>,
    caseF: Case<T, F>,
    caseG: Case<T, G>,
    caseH: Case<T, H>,
): Reducer<T, Action>;
export function matchAction<
  T,
  A extends AnonTA,
  B extends AnonTA,
  C extends AnonTA,
  D extends AnonTA,
  E extends AnonTA,
  F extends AnonTA,
  G extends AnonTA,
  H extends AnonTA,
  I extends AnonTA,
  >(initialState: T,
    caseA: Case<T, A>,
    caseB: Case<T, B>,
    caseC: Case<T, C>,
    caseD: Case<T, D>,
    caseE: Case<T, E>,
    caseF: Case<T, F>,
    caseG: Case<T, G>,
    caseH: Case<T, H>,
    caseI: Case<T, I>,
): Reducer<T, Action>;
export function matchAction<
  T,
  A extends AnonTA,
  B extends AnonTA,
  C extends AnonTA,
  D extends AnonTA,
  E extends AnonTA,
  F extends AnonTA,
  G extends AnonTA,
  H extends AnonTA,
  I extends AnonTA,
  J extends AnonTA,
  >(initialState: T,
    caseA: Case<T, A>,
    caseB: Case<T, B>,
    caseC: Case<T, C>,
    caseD: Case<T, D>,
    caseE: Case<T, E>,
    caseF: Case<T, F>,
    caseG: Case<T, G>,
    caseH: Case<T, H>,
    caseI: Case<T, I>,
    caseJ: Case<T, J>,
): Reducer<T, Action>;
export function matchAction<
  T,
  A extends AnonTA,
  B extends AnonTA,
  C extends AnonTA,
  D extends AnonTA,
  E extends AnonTA,
  F extends AnonTA,
  G extends AnonTA,
  H extends AnonTA,
  I extends AnonTA,
  J extends AnonTA,
  K extends AnonTA,
  >(initialState: T,
    caseA: Case<T, A>,
    caseB: Case<T, B>,
    caseC: Case<T, C>,
    caseD: Case<T, D>,
    caseE: Case<T, E>,
    caseF: Case<T, F>,
    caseG: Case<T, G>,
    caseH: Case<T, H>,
    caseI: Case<T, I>,
    caseJ: Case<T, J>,
    caseK: Case<T, K>,
): Reducer<T, Action>;
export function matchAction<
  T,
  A extends AnonTA,
  B extends AnonTA,
  C extends AnonTA,
  D extends AnonTA,
  E extends AnonTA,
  F extends AnonTA,
  G extends AnonTA,
  H extends AnonTA,
  I extends AnonTA,
  J extends AnonTA,
  K extends AnonTA,
  L extends AnonTA,
  >(initialState: T,
    caseA: Case<T, A>,
    caseB: Case<T, B>,
    caseC: Case<T, C>,
    caseD: Case<T, D>,
    caseE: Case<T, E>,
    caseF: Case<T, F>,
    caseG: Case<T, G>,
    caseH: Case<T, H>,
    caseI: Case<T, I>,
    caseJ: Case<T, J>,
    caseK: Case<T, K>,
    caseL: Case<T, L>,
): Reducer<T, Action>;
export function matchAction<
  T,
  A extends AnonTA,
  B extends AnonTA,
  C extends AnonTA,
  D extends AnonTA,
  E extends AnonTA,
  F extends AnonTA,
  G extends AnonTA,
  H extends AnonTA,
  I extends AnonTA,
  J extends AnonTA,
  K extends AnonTA,
  L extends AnonTA,
  M extends AnonTA,
  >(initialState: T,
    caseA: Case<T, A>,
    caseB: Case<T, B>,
    caseC: Case<T, C>,
    caseD: Case<T, D>,
    caseE: Case<T, E>,
    caseF: Case<T, F>,
    caseG: Case<T, G>,
    caseH: Case<T, H>,
    caseI: Case<T, I>,
    caseJ: Case<T, J>,
    caseK: Case<T, K>,
    caseL: Case<T, L>,
    caseM: Case<T, M>,
): Reducer<T, Action>;
export function matchAction<
  T,
  A extends AnonTA,
  B extends AnonTA,
  C extends AnonTA,
  D extends AnonTA,
  E extends AnonTA,
  F extends AnonTA,
  G extends AnonTA,
  H extends AnonTA,
  I extends AnonTA,
  J extends AnonTA,
  K extends AnonTA,
  L extends AnonTA,
  M extends AnonTA,
  N extends AnonTA,
  >(initialState: T,
    caseA: Case<T, A>,
    caseB: Case<T, B>,
    caseC: Case<T, C>,
    caseD: Case<T, D>,
    caseE: Case<T, E>,
    caseF: Case<T, F>,
    caseG: Case<T, G>,
    caseH: Case<T, H>,
    caseI: Case<T, I>,
    caseJ: Case<T, J>,
    caseK: Case<T, K>,
    caseL: Case<T, L>,
    caseM: Case<T, M>,
    caseN: Case<T, N>,
  ): Reducer<T, Action>;
export function matchAction<
  T,
  A extends AnonTA,
  B extends AnonTA,
  C extends AnonTA,
  D extends AnonTA,
  E extends AnonTA,
  F extends AnonTA,
  G extends AnonTA,
  H extends AnonTA,
  I extends AnonTA,
  J extends AnonTA,
  K extends AnonTA,
  L extends AnonTA,
  M extends AnonTA,
  N extends AnonTA,
  O extends AnonTA,
  >(initialState: T,
    caseA: Case<T, A>,
    caseB: Case<T, B>,
    caseC: Case<T, C>,
    caseD: Case<T, D>,
    caseE: Case<T, E>,
    caseF: Case<T, F>,
    caseG: Case<T, G>,
    caseH: Case<T, H>,
    caseI: Case<T, I>,
    caseJ: Case<T, J>,
    caseK: Case<T, K>,
    caseL: Case<T, L>,
    caseM: Case<T, M>,
    caseN: Case<T, N>,
    caseO: Case<T, O>,
  ): Reducer<T, Action>;
export function matchAction<
  T,
  A extends AnonTA,
  B extends AnonTA,
  C extends AnonTA,
  D extends AnonTA,
  E extends AnonTA,
  F extends AnonTA,
  G extends AnonTA,
  H extends AnonTA,
  I extends AnonTA,
  J extends AnonTA,
  K extends AnonTA,
  L extends AnonTA,
  M extends AnonTA,
  N extends AnonTA,
  O extends AnonTA,
  P extends AnonTA,
  >(initialState: T,
    caseA: Case<T, A>,
    caseB: Case<T, B>,
    caseC: Case<T, C>,
    caseD: Case<T, D>,
    caseE: Case<T, E>,
    caseF: Case<T, F>,
    caseG: Case<T, G>,
    caseH: Case<T, H>,
    caseI: Case<T, I>,
    caseJ: Case<T, J>,
    caseK: Case<T, K>,
    caseL: Case<T, L>,
    caseM: Case<T, M>,
    caseN: Case<T, N>,
    caseO: Case<T, O>,
    caseP: Case<T, P>
  ): Reducer<T, Action>;
export function matchAction<T>(initialState: T, ...cases: Case<T, AnonTA>[]): Reducer<T, Action> {
  return function reduce(state: T = initialState, action: Action): T {
    for (const [ac, fold] of cases) {
      if (ac.test(action)) return fold(state, action.payload);
    }
    return state;
  }
}

/**
 * Creates a composite reducer. The provided reducers are called right-to-left,
 * where the previous reducer's return value is passed as `state` to the next
 * reducer.
 *
 * @param reducers
 */
export const composeReducers = <T, S extends Action>(...reducers: Reducer<T, S>[]): Reducer<T, S> => (state: T | undefined, action: S) =>
  reducers.reduceRight((state, reducer) => reducer(state, action), state) as T;


type ReducerRecord<T> = {
  [K in keyof T]: Reducer<T[K], Action>
}

export function combineReducers<T>(reducers: ReducerRecord<T>): Reducer<T, Action> {
  return function reduce(state: T = {} as T, action: Action): T {
    for (const key in reducers) {
      const subState = state[key];
      const reduceSubState = reducers[key];
      const nextSubState = reduceSubState(subState, action);
      if (nextSubState !== subState) {
        state = Object.assign({}, state, { [key]: nextSubState });
      }
    }
    return state;
  }
}
