import { isEqual, stubTrue, negate } from 'lodash';
import { AnyAction } from 'redux';
import { concat, of, Observable, from, Observer, OperatorFunction } from 'rxjs';
import {
  catchError,
  filter,
  mergeMap,
  takeWhile,
  switchMap,
  concatMap,
  tap,
} from 'rxjs/operators';
import { StateObservable, ActionsObservable } from 'redux-observable';

import { notifyUnhandledError } from '../Actions/UnhandledErrorActions';
import { EpicDependencies, ModuleEpic } from '../Core/Store';

export interface Action<Type extends string, Payload> {
  readonly type: Type;
  readonly payload: Payload;
}

export interface ActionTypeGuard<T extends Action<string, any>> {
  (action: { type: string }): action is T;
}

export interface ActionTypeGuardContainer<T extends Action<string, any>> {
  isOfType: ActionTypeGuard<T>;
}

export type ActionCreator<T, Args> = T extends Action<infer Type, infer Payload>
  ? Args extends any[]
    ? { readonly type: Type; (...args: Args): T } & ActionTypeGuardContainer<T>
    : { readonly type: Type; (): T } & ActionTypeGuardContainer<T>
  : never;

// Utility type to infer the Action type from the ActionCreator
export type InferAction<T> = T extends ActionCreator<infer A, any>
  ? A
  : T extends ActionCreator<infer A, []>
  ? A
  : never;

// This is the main utility function
export function makeActionCreator<Type extends string>(
  type: Type
): ActionCreator<Action<Type, undefined>, []>;
export function makeActionCreator<
  Type extends string,
  Args extends any[],
  Payload
>(
  type: Type,
  createPayload: (...args: Args) => Payload
): ActionCreator<Action<Type, Payload>, Args>;
export function makeActionCreator<
  Type extends string,
  Args extends any[],
  Payload
>(type: Type, createPayload?: (...args: Args) => Payload) {
  function createAction(...args: Args) {
    return {
      type,
      payload: createPayload && createPayload(...args),
    };
  }

  function isOfType(otherAction: {
    type: string;
  }): otherAction is Action<Type, Payload> {
    return otherAction.type === type;
  }

  return Object.assign(createAction, { type, isOfType });
}

export type GenericActionCreator = ActionCreator<Action<string, any>, any>;

export interface Request2Fulfill<T, State> {
  (
    requestActions: T,
    state: StateObservable<State>,
    dependencies: EpicDependencies
  ): Promise<AnyAction>;
}

export interface MapRequestActionsToEpicOptions<T, State> {
  areActionsNew?: (actions: T, prevActions: T) => boolean;
  areActionsCoherent?: (actions: T, state: State) => boolean;
}

interface Pred<T> {
  (value: T): boolean;
}

/**
 * A factory for `OperatorFunction`. Examples of `OperatorFactory`
 * are `mergeMap`, `concatMap`, and `switchMap` from `rxjs/operators`.
 */
type MapOperatorFactory = typeof mergeMap;

/**
 * Creates an Epic that calls `request2Fulfill` when actions matching the
 * supplied set of ActionCreators have been dispatched. `request2Fulfill` is
 * called when all of the actions have been dispatched, and when any of them
 * are dispatched thereafter.
 */
interface MapRequestActionsToEpic {
  // The following overloads are so that we can capture type parameters for
  // ActionCreators being passed.  Each overload specifies the length of the
  // array of action creators accepted, which should also match the length of the
  // array of actions accepted by `request2Fulfill`. Note that the elements in
  // these arrays should correspond to one another by position.
  //
  // Add more overloads when needed.

  // 1 request action
  <A1 extends Action<string, any>, State>(
    actionCreators: [ActionCreator<A1, any>],
    request2Fulfill: Request2Fulfill<[A1], State>,
    options?: MapRequestActionsToEpicOptions<[A1], State>
  ): ModuleEpic<State, AnyAction>;

  // 2 request action
  <A1 extends Action<string, any>, A2 extends Action<string, any>, State>(
    actionCreators: [ActionCreator<A1, any>, ActionCreator<A2, any>],
    request2Fulfill: Request2Fulfill<[A1, A2], State>,
    options?: MapRequestActionsToEpicOptions<[A1, A2], State>
  ): ModuleEpic<State, AnyAction>;

  // 3 request action
  <
    A1 extends Action<string, any>,
    A2 extends Action<string, any>,
    A3 extends Action<string, any>,
    State
  >(
    actionCreators: [
      ActionCreator<A1, any>,
      ActionCreator<A2, any>,
      ActionCreator<A3, any>
    ],
    request2Fulfill: Request2Fulfill<[A1, A2, A3], State>,
    options?: MapRequestActionsToEpicOptions<[A1, A2, A3], State>
  ): ModuleEpic<State, AnyAction>;

  // 4 request action
  <
    A1 extends Action<string, any>,
    A2 extends Action<string, any>,
    A3 extends Action<string, any>,
    A4 extends Action<string, any>,
    State
  >(
    actionCreators: [
      ActionCreator<A1, any>,
      ActionCreator<A2, any>,
      ActionCreator<A3, any>,
      ActionCreator<A4, any>
    ],
    request2Fulfill: Request2Fulfill<[A1, A2, A3, A4], State>,
    options?: MapRequestActionsToEpicOptions<[A1, A2, A3, A4], State>
  ): ModuleEpic<State, AnyAction>;

  // 5 request action
  <
    A1 extends Action<string, any>,
    A2 extends Action<string, any>,
    A3 extends Action<string, any>,
    A4 extends Action<string, any>,
    A5 extends Action<string, any>,
    State
  >(
    actionCreators: [
      ActionCreator<A1, any>,
      ActionCreator<A2, any>,
      ActionCreator<A3, any>,
      ActionCreator<A4, any>,
      ActionCreator<A5, any>
    ],
    request2Fulfill: Request2Fulfill<[A1, A2, A3, A4, A5], State>,
    options?: MapRequestActionsToEpicOptions<[A1, A2, A3, A4, A5], State>
  ): ModuleEpic<State, AnyAction>;

  // 6 request action
  <
    A1 extends Action<string, any>,
    A2 extends Action<string, any>,
    A3 extends Action<string, any>,
    A4 extends Action<string, any>,
    A5 extends Action<string, any>,
    A6 extends Action<string, any>,
    State
  >(
    actionCreators: [
      ActionCreator<A1, any>,
      ActionCreator<A2, any>,
      ActionCreator<A3, any>,
      ActionCreator<A4, any>,
      ActionCreator<A5, any>,
      ActionCreator<A6, any>
    ],
    request2Fulfill: Request2Fulfill<[A1, A2, A3, A4, A5, A6], State>,
    options?: MapRequestActionsToEpicOptions<[A1, A2, A3, A4, A5, A6], State>
  ): ModuleEpic<State, AnyAction>;

  // 7 request action
  <
    A1 extends Action<string, any>,
    A2 extends Action<string, any>,
    A3 extends Action<string, any>,
    A4 extends Action<string, any>,
    A5 extends Action<string, any>,
    A6 extends Action<string, any>,
    A7 extends Action<string, any>,
    State
  >(
    actionCreators: [
      ActionCreator<A1, any>,
      ActionCreator<A2, any>,
      ActionCreator<A3, any>,
      ActionCreator<A4, any>,
      ActionCreator<A5, any>,
      ActionCreator<A6, any>,
      ActionCreator<A7, any>
    ],
    request2Fulfill: Request2Fulfill<[A1, A2, A3, A4, A5, A6, A7], State>,
    options?: MapRequestActionsToEpicOptions<
      [A1, A2, A3, A4, A5, A6, A7],
      State
    >
  ): ModuleEpic<State, AnyAction>;

  // 8 request action
  <
    A1 extends Action<string, any>,
    A2 extends Action<string, any>,
    A3 extends Action<string, any>,
    A4 extends Action<string, any>,
    A5 extends Action<string, any>,
    A6 extends Action<string, any>,
    A7 extends Action<string, any>,
    A8 extends Action<string, any>,
    State
  >(
    actionCreators: [
      ActionCreator<A1, any>,
      ActionCreator<A2, any>,
      ActionCreator<A3, any>,
      ActionCreator<A4, any>,
      ActionCreator<A5, any>,
      ActionCreator<A6, any>,
      ActionCreator<A7, any>,
      ActionCreator<A8, any>
    ],
    request2Fulfill: Request2Fulfill<[A1, A2, A3, A4, A5, A6, A7, A8], State>,
    options?: MapRequestActionsToEpicOptions<
      [A1, A2, A3, A4, A5, A6, A7, A8],
      State
    >
  ): ModuleEpic<State, AnyAction>;
}

/**
 * Factory that creates a `MapRequestActionsToEpic` function with the supplied
 * `MapOperatorFactory`.
 */
export const mapRequestActionsToEpicWith =
  (mapOperatorFactory: MapOperatorFactory): MapRequestActionsToEpic =>
  <State>(
    actionCreators: GenericActionCreator[],
    request2Fulfill: Request2Fulfill<any, State>,
    options: MapRequestActionsToEpicOptions<any, State> = {}
  ): ModuleEpic<State, AnyAction> => {
    return function mapRequestActionsEpic(
      action$: Observable<AnyAction>,
      state$: StateObservable<State>,
      dependencies: EpicDependencies
    ) {
      const actionStreams = actionCreators.map((ac) =>
        action$.pipe(filter(ac.isOfType))
      );
      const filterActions = makeFilterActions(options);
      // track previous filtered actions to be passed to `filterActions`
      let prevFilteredActions: AnyAction[] | undefined = undefined;
      const combined$ = combineLatestIf<AnyAction>(actionStreams, (actions) => {
        const ret = filterActions(actions, prevFilteredActions, state$.value);
        // only update `prevFilteredActions` if `filterActions` returns `true`
        if (ret) prevFilteredActions = actions;
        return ret;
      });
      return combined$.pipe(
        mapOperatorFactory((actions) =>
          from(request2Fulfill(actions, state$, dependencies))
        )
      );
    };
  };

function makeFilterActions<T extends [], S>(
  options: MapRequestActionsToEpicOptions<T, S>
) {
  const { areActionsCoherent = stubTrue, areActionsNew = negate(isEqual) } =
    options;
  return function filterActions(
    actions: T,
    prevActions: T | undefined,
    state: S
  ): boolean {
    return (
      areActionsCoherent(actions, state) &&
      (prevActions == null || areActionsNew(actions, prevActions))
    );
  };
}

/**
 * `MapRequestActionsToEpic` that uses `mergeMap` to rate limit output actions.
 */
export const mergeMapRequestActionsToEpic: MapRequestActionsToEpic =
  mapRequestActionsToEpicWith(mergeMap);

/**
 * `MapRequestActionsToEpic` that uses `concatMap` to rate limit output actions.
 */
export const concatMapRequestActionsToEpic: MapRequestActionsToEpic =
  mapRequestActionsToEpicWith(concatMap);

/**
 * `MapRequestActionsToEpic` that uses `switchMap` to rate limit output actions.
 */
export const switchMapRequestActionsToEpic: MapRequestActionsToEpic =
  mapRequestActionsToEpicWith(switchMap);

interface TakeEpicInWindowOptions<
  StartAction extends AnyAction,
  EndAction extends AnyAction
> {
  startActionCreator: ActionCreator<StartAction, any>;
  endActionCreator: ActionCreator<EndAction, any>;
  compareStartAndEndActions?: (
    startAction: StartAction,
    endAction: EndAction
  ) => boolean;
}

/**
 * Starts the target epic when `startAction` is emitted, until `endAction` is
 * emitted.
 */
export function takeEpicInWindow<
  State,
  StartAction extends AnyAction,
  EndAction extends AnyAction
>(
  options: TakeEpicInWindowOptions<StartAction, EndAction>,
  epic: ModuleEpic<State, AnyAction>
): ModuleEpic<State, AnyAction> {
  const {
    startActionCreator,
    endActionCreator,
    compareStartAndEndActions = stubTrue,
  } = options;
  return function takeUntilEpic(action$, state$, deps) {
    // TODO Add logging diagnostics
    return action$.pipe(
      filter(startActionCreator.isOfType),
      mergeMap((startAction: StartAction) => {
        // FIXME New epics are starting before previous are ending
        const logTag = `[${startActionCreator.type} - ${
          endActionCreator.type
        } -- ${JSON.stringify(startAction)}]`;
        const log = (...args: any[]) => console.log(logTag, '--', ...args);
        const window$ = concat(
          of(startAction),
          action$.pipe(
            // Filter out other start actions. We might want to do some sort of comparison with startAction...?
            filter((action) => !startActionCreator.isOfType(action)),
            takeWhile((action) => {
              return (
                !endActionCreator.isOfType(action) ||
                !compareStartAndEndActions(startAction, action as EndAction)
              );
            })
          )
        );
        log('starting epic', startAction);
        return epic(ActionsObservable.from(window$), state$, deps).pipe(
          tap(
            (action) => {
              log(
                'action produced by epic in window',
                action.type,
                'payload' in action ? action.payload : undefined
              );
            },
            (error) => {
              log('error produced by epic in window', error);
            },
            () => {
              log('ending epic', startAction);
            }
          )
        );
      })
    );
  };
}

export function combineLatestIf<T>(
  s1: Observable<T>,
  pred: Pred<[T]>
): Observable<[T]>;
export function combineLatestIf<T, T2>(
  s1: Observable<T>,
  s2: Observable<T2>,
  pred: Pred<[T, T2]>
): Observable<[T, T2]>;
export function combineLatestIf<T, T2, T3>(
  s1: Observable<T>,
  s2: Observable<T2>,
  s3: Observable<T3>,
  pred: Pred<[T, T2, T3]>
): Observable<[T, T2, T3]>;
export function combineLatestIf<T, T2, T3, T4>(
  s1: Observable<T>,
  s2: Observable<T2>,
  s3: Observable<T3>,
  s4: Observable<T4>,
  pred: Pred<[T, T2, T3, T4]>
): Observable<[T, T2, T3, T4]>;
export function combineLatestIf<T, T2, T3, T4, T5>(
  s1: Observable<T>,
  s2: Observable<T2>,
  s3: Observable<T3>,
  s4: Observable<T4>,
  s5: Observable<T5>,
  pred: Pred<[T, T2, T3, T4, T5]>
): Observable<[T, T2, T3, T4, T5]>;
export function combineLatestIf<T, T2, T3, T4, T5, T6>(
  s1: Observable<T>,
  s2: Observable<T2>,
  s3: Observable<T3>,
  s4: Observable<T4>,
  s5: Observable<T5>,
  s6: Observable<T6>,
  pred: Pred<[T, T2, T3, T4, T5, T6]>
): Observable<[T, T2, T3, T4, T5, T6]>;
export function combineLatestIf<T, T2, T3, T4, T5, T6, T7>(
  s1: Observable<T>,
  s2: Observable<T2>,
  s3: Observable<T3>,
  s4: Observable<T4>,
  s5: Observable<T5>,
  s6: Observable<T6>,
  s7: Observable<T7>,
  pred: Pred<[T, T2, T3, T4, T5, T6, T7]>
): Observable<[T, T2, T3, T4, T5, T6, T7]>;
export function combineLatestIf<T, T2, T3, T4, T5, T6, T7, T8>(
  s1: Observable<T>,
  s2: Observable<T2>,
  s3: Observable<T3>,
  s4: Observable<T4>,
  s5: Observable<T5>,
  s6: Observable<T6>,
  s7: Observable<T7>,
  s8: Observable<T8>,
  pred: Pred<[T, T2, T3, T4, T5, T6, T7, T8]>
): Observable<[T, T2, T3, T4, T5, T6, T7, T8]>;
export function combineLatestIf<T>(
  sources: Array<Observable<T>>,
  pred: (values: T[]) => boolean
): Observable<T[]>;
export function combineLatestIf<T>(
  ...args: Array<
    Observable<T> | Array<Observable<T>> | ((values: any) => boolean)
  >
): Observable<T[]> {
  const pred = args[args.length - 1] as (values: T[]) => boolean;
  const rest = args.slice(0, -1);
  const sources = (
    rest.length === 1 && Array.isArray(rest[0]) ? rest[0] : rest
  ) as Array<Observable<T>>;
  return Observable.create(function subscribe(observer: Observer<T[]>) {
    // latest value of each source
    const currentValue: T[] = [];
    // set of indexes of sources that have emitted
    let emitted = new Set();
    // incremented when each source completes
    let completedCount = 0;
    // create array of source subscriptions
    const subscriptions = sources.map((source$, index) => {
      return source$.subscribe({
        next: (value) => {
          emitted.add(index);
          const oldValue = currentValue[index];
          currentValue[index] = value;
          if (emitted.size === sources.length) {
            const valueToEmit = currentValue.slice();
            if (pred(valueToEmit)) {
              observer.next(valueToEmit);
            } else {
              currentValue[index] = oldValue;
            }
          }
        },
        error: (error) => observer.error(error),
        complete: () => {
          completedCount++;
          if (completedCount === sources.length) {
            observer.complete();
          }
        },
      });
    });
    // clean up logic to unsubscribe to source subscriptions
    return function unsubscribe() {
      subscriptions.forEach((s) => s.unsubscribe());
    };
  });
}

// Utility to partially apply a function. This type definiton works with how we
// define ActionCreator. Eventually, we want to curry ActionCreator.
export type Partial1<T> = T extends (soleArg: infer sole) => infer Return
  ? () => Return
  : T extends (first: infer first, ...rest: infer Rest) => infer Return
  ? (...rest: Rest) => Return
  : never;

export function partial<T, F extends Function>(fn: F, t: T): Partial1<F>;
export function partial(fn: Function, t: any) {
  return function (...args: any[]) {
    return fn(t, ...args);
  };
}
