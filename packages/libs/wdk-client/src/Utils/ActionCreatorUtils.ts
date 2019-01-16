import { isEqual, stubTrue } from 'lodash';
import {concat, empty, of, Observable, combineLatest, from, Observer, OperatorFunction} from 'rxjs';
import {catchError, filter, mergeMap, takeUntil, switchMap, concatMap, tap} from 'rxjs/operators';
import { StateObservable, ActionsObservable } from 'redux-observable';

import {Action as WdkAction} from 'wdk-client/Actions';
import { EpicDependencies, ModuleEpic } from 'wdk-client/Core/Store';

interface Action<Type extends string, Payload> {
  readonly type: Type;
  readonly payload: Payload;
}

type ExtractWdkActionType<T extends WdkAction> = T['type'];

type ExtractWdkActionPayload<T extends WdkAction> = T extends Action<string, any> ? T['payload'] : undefined;

interface ActionTypeGuard<Type extends string, Payload> {
  (action: { type: string }): action is Action<Type, Payload>;
}

interface ActionTypeGuardContainer<Type extends string, Payload> {
  isOfType: ActionTypeGuard<Type, Payload>;
}

export interface ActionCreator<Type extends string, Args extends any[], Payload> extends ActionTypeGuardContainer<Type, String> {
  readonly type: Type;
  (...args: Args): Action<Type, Payload>;
}

// Utility type to infer the Action type from the ActionCreator
export type InferAction<T extends ActionCreator<string, any, any>> =
  T extends ActionCreator<infer Type, any, infer Payload>
    ? Action<Type, Payload>
    : never;

// This is the main utility function
export function makeActionCreator<Type extends string>(
  type: Type
) : ActionCreator<Type, [], undefined>;
export function makeActionCreator<Type extends string, Args extends any[], Payload>(
  type: Type,
  createPayload: (...args: Args) => Payload
) : ActionCreator<Type, Args, Payload>
export function makeActionCreator<Type extends string, Args extends any[], Payload>(
  type: Type,
  createPayload?: (...args: Args) => Payload
) {

  function createAction(...args: Args) {
    return {
      type,
      payload: createPayload && createPayload(...args)
    };
  }

  function isOfType(otherAction: { type: string }): otherAction is Action<Type, Payload> {
    return otherAction.type === type;
  }

  return Object.assign(createAction, { type, isOfType });
}


type GenericActionCreator = ActionCreator<string, any[], any>;

interface Request2Fulfill<T, State> {
  (
    requestActions: T,
    state: StateObservable<State>,
    dependencies: EpicDependencies
  ): Promise<WdkAction>
}

interface MapRequestActionsToEpicOptions<T, State> {
  areActionsNew?: (actions: T, prevActions?: T) => boolean;
  areActionsCoherent?: (actions: T, state: State) => boolean;
}

interface Pred<T> {
  (value: T): boolean;
}

/**
 * A factory for `OperatorFunction`. Examples of `OperatorFactory`
 * are `mergeMap`, `concatMap`, and `switchMap` from `rxjs/operators`.
 */
interface MapOperatorFactory {
  <T, R>(value: T): OperatorFunction<T, R>;
}

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
  <
    T1 extends string,
    A1 extends any[],
    P1,
    State
  >(
    actionCreators: [
      ActionCreator<T1, A1, P1>
    ],
    request2Fulfill: Request2Fulfill<[
      Action<T1, P1>
    ], State>,
    options?: MapRequestActionsToEpicOptions<[
      Action<T1, P1>
    ], State>

  ): ModuleEpic<State>;

  // 2 request action
  <
    T1 extends string,
    A1 extends any[],
    P1,
    T2 extends string,
    A2 extends any[],
    P2,
    State
  >(
    actionCreators: [
      ActionCreator<T1, A1, P1>,
      ActionCreator<T2, A2, P2>
    ],
    request2Fulfill: Request2Fulfill<[
      Action<T1, P1>,
      Action<T2, P2>
    ], State>,
    options?: MapRequestActionsToEpicOptions<[
      Action<T1, P1>,
      Action<T2, P2>
    ], State>

  ): ModuleEpic<State>;

  // 3 request action
  <
    T1 extends string,
    A1 extends any[],
    P1,
    T2 extends string,
    A2 extends any[],
    P2,
    T3 extends string,
    A3 extends any[],
    P3,
    State
  >(
    actionCreators: [
      ActionCreator<T1, A1, P1>,
      ActionCreator<T2, A2, P2>,
      ActionCreator<T3, A3, P3>
    ],
    request2Fulfill: Request2Fulfill<[
      Action<T1, P1>,
      Action<T2, P2>,
      Action<T3, P3>
    ], State>,
    options?: MapRequestActionsToEpicOptions<[
      Action<T1, P1>,
      Action<T2, P2>,
      Action<T3, P3>
    ], State>

  ): ModuleEpic<State>;

  // 4 request action
  <
    T1 extends string,
    A1 extends any[],
    P1,
    T2 extends string,
    A2 extends any[],
    P2,
    T3 extends string,
    A3 extends any[],
    P3,
    T4 extends string,
    A4 extends any[],
    P4,
    State
  >(
    actionCreators: [
      ActionCreator<T1, A1, P1>,
      ActionCreator<T2, A2, P2>,
      ActionCreator<T3, A3, P3>,
      ActionCreator<T4, A4, P4>
    ],
    request2Fulfill: Request2Fulfill<[
      Action<T1, P1>,
      Action<T2, P2>,
      Action<T3, P3>,
      Action<T4, P4>
    ], State>,
    options?: MapRequestActionsToEpicOptions<[
      Action<T1, P1>,
      Action<T2, P2>,
      Action<T3, P3>,
      Action<T4, P4>
    ], State>

  ): ModuleEpic<State>;

  // 5 request action
  <
    T1 extends string,
    A1 extends any[],
    P1,
    T2 extends string,
    A2 extends any[],
    P2,
    T3 extends string,
    A3 extends any[],
    P3,
    T4 extends string,
    A4 extends any[],
    P4,
    T5 extends string,
    A5 extends any[],
    P5,
    State
  >(
    actionCreators: [
      ActionCreator<T1, A1, P1>,
      ActionCreator<T2, A2, P2>,
      ActionCreator<T3, A3, P3>,
      ActionCreator<T4, A4, P4>,
      ActionCreator<T5, A5, P5>
    ],
    request2Fulfill: Request2Fulfill<[
      Action<T1, P1>,
      Action<T2, P2>,
      Action<T3, P3>,
      Action<T4, P4>,
      Action<T5, P5>
    ], State>,
    options?: MapRequestActionsToEpicOptions<[
      Action<T1, P1>,
      Action<T2, P2>,
      Action<T3, P3>,
      Action<T4, P4>,
      Action<T5, P5>
    ], State>

  ): ModuleEpic<State>;

  // 6 request action
  <
    T1 extends string,
    A1 extends any[],
    P1,
    T2 extends string,
    A2 extends any[],
    P2,
    T3 extends string,
    A3 extends any[],
    P3,
    T4 extends string,
    A4 extends any[],
    P4,
    T5 extends string,
    A5 extends any[],
    P5,
    T6 extends string,
    A6 extends any[],
    P6,
    State
  >(
    actionCreators: [
      ActionCreator<T1, A1, P1>,
      ActionCreator<T2, A2, P2>,
      ActionCreator<T3, A3, P3>,
      ActionCreator<T4, A4, P4>,
      ActionCreator<T5, A5, P5>,
      ActionCreator<T6, A6, P6>
    ],
    request2Fulfill: Request2Fulfill<[
      Action<T1, P1>,
      Action<T2, P2>,
      Action<T3, P3>,
      Action<T4, P4>,
      Action<T5, P5>,
      Action<T6, P6>
    ], State>,
    options?: MapRequestActionsToEpicOptions<[
      Action<T1, P1>,
      Action<T2, P2>,
      Action<T3, P3>,
      Action<T4, P4>,
      Action<T5, P5>,
      Action<T6, P6>
    ], State>

  ): ModuleEpic<State>;

  // 7 request action
  <
    T1 extends string,
    A1 extends any[],
    P1,
    T2 extends string,
    A2 extends any[],
    P2,
    T3 extends string,
    A3 extends any[],
    P3,
    T4 extends string,
    A4 extends any[],
    P4,
    T5 extends string,
    A5 extends any[],
    P5,
    T6 extends string,
    A6 extends any[],
    P6,
    T7 extends string,
    A7 extends any[],
    P7,
    State
  >(
    actionCreators: [
      ActionCreator<T1, A1, P1>,
      ActionCreator<T2, A2, P2>,
      ActionCreator<T3, A3, P3>,
      ActionCreator<T4, A4, P4>,
      ActionCreator<T5, A5, P5>,
      ActionCreator<T6, A6, P6>,
      ActionCreator<T7, A7, P7>
    ],
    request2Fulfill: Request2Fulfill<[
      Action<T1, P1>,
      Action<T2, P2>,
      Action<T3, P3>,
      Action<T4, P4>,
      Action<T5, P5>,
      Action<T6, P6>,
      Action<T7, P7>
    ], State>,
    options?: MapRequestActionsToEpicOptions<[
      Action<T1, P1>,
      Action<T2, P2>,
      Action<T3, P3>,
      Action<T4, P4>,
      Action<T5, P5>,
      Action<T6, P6>,
      Action<T7, P7>
    ], State>

  ): ModuleEpic<State>;

  // 8 request action
  <
    T1 extends string,
    A1 extends any[],
    P1,
    T2 extends string,
    A2 extends any[],
    P2,
    T3 extends string,
    A3 extends any[],
    P3,
    T4 extends string,
    A4 extends any[],
    P4,
    T5 extends string,
    A5 extends any[],
    P5,
    T6 extends string,
    A6 extends any[],
    P6,
    T7 extends string,
    A7 extends any[],
    P7,
    T8 extends string,
    A8 extends any[],
    P8,
    State
  >(
    actionCreators: [
      ActionCreator<T1, A1, P1>,
      ActionCreator<T2, A2, P2>,
      ActionCreator<T3, A3, P3>,
      ActionCreator<T4, A4, P4>,
      ActionCreator<T5, A5, P5>,
      ActionCreator<T6, A6, P6>,
      ActionCreator<T7, A7, P7>,
      ActionCreator<T8, A8, P8>
    ],
    request2Fulfill: Request2Fulfill<[
      Action<T1, P1>,
      Action<T2, P2>,
      Action<T3, P3>,
      Action<T4, P4>,
      Action<T5, P5>,
      Action<T6, P6>,
      Action<T7, P7>,
      Action<T8, P8>
    ], State>,
    options?: MapRequestActionsToEpicOptions<[
      Action<T1, P1>,
      Action<T2, P2>,
      Action<T3, P3>,
      Action<T4, P4>,
      Action<T5, P5>,
      Action<T6, P6>,
      Action<T7, P7>,
      Action<T8, P8>
    ], State>

  ): ModuleEpic<State>;

}

/**
 * Factory that creates a `MapRequestActionsToEpic` function with the supplied
 * `MapOperatorFactory`.
 */
export const mapRequestActionsToEpicWith = (mapOperatorFactory: MapOperatorFactory): MapRequestActionsToEpic => <State>(
  actionCreators: GenericActionCreator[],
  request2Fulfill: Request2Fulfill<any, State>,
  options: MapRequestActionsToEpicOptions<any, State> = {}
): ModuleEpic<State> => {
  return function mapRequestActionsEpic(
    action$: Observable<WdkAction>,
    state$: StateObservable<State>,
    dependencies: EpicDependencies,
  ) {
    const actionStreams = actionCreators.map(ac => action$.pipe(filter(ac.isOfType)));
    const filterActions = makeFilterActions(options);
    // track previous filtered actions to be passed to `filterActions`
    let prevFilteredActions: Action<string, any>[] | undefined = undefined;
    const combined$ = combineLatestIf(actionStreams, actions => {
      const ret = filterActions(actions, prevFilteredActions, state$.value);
      // only update `prevFilteredActions` if `filterActions` returns `true`
      if (ret) prevFilteredActions = actions;
      return ret;
    });
    return combined$.pipe(
      mapOperatorFactory((actions: any) => {
        return from(request2Fulfill(actions, state$, dependencies))
      }),
      catchError((err: Error) => {
        // TODO submit error to wdkService
        console.error(err);
        return empty();
      })
    );
  };
}

function makeFilterActions<T extends [], S>(options: MapRequestActionsToEpicOptions<T, S>) {
  const { areActionsCoherent = stubTrue, areActionsNew = isEqual } = options;
  return function filterActions(actions: T, prevActions: T | undefined, state: S): boolean {
    return (
      areActionsCoherent(actions, state) &&
      ( prevActions == null || areActionsNew(actions, prevActions) )
    );
  }
}

/**
 * `MapRequestActionsToEpic` that uses `mergeMap` to rate limit output actions.
 */
export const mergeMapRequestActionsToEpic: MapRequestActionsToEpic = mapRequestActionsToEpicWith(mergeMap);

/**
 * `MapRequestActionsToEpic` that uses `concatMap` to rate limit output actions.
 */
export const concatMapRequestActionsToEpic: MapRequestActionsToEpic = mapRequestActionsToEpicWith(concatMap);

/**
 * `MapRequestActionsToEpic` that uses `switchMap` to rate limit output actions.
 */
export const switchMapRequestActionsToEpic: MapRequestActionsToEpic = mapRequestActionsToEpicWith(switchMap);

/**
 * Starts the target epic when `startAction` is emitted, until `endAction` is
 * emitted.
 */
export function takeEpicInWindow<State, StartAction extends WdkAction, EndAction extends WdkAction>(
  startActionCreator: ActionCreator<ExtractWdkActionType<StartAction>, any, ExtractWdkActionPayload<StartAction>>,
  endActionCreator: ActionCreator<ExtractWdkActionType<EndAction>, any, ExtractWdkActionPayload<EndAction>>,
  epic: ModuleEpic<State>,
): ModuleEpic<State> {
  return function takeUntilEpic(action$, state$, deps) {
    // TODO Add logging diagnostics
    const logTag = `[${startActionCreator.type} - ${endActionCreator.type}]`;
    const end$ = action$.pipe(
      filter(endActionCreator.isOfType),
      tap(action => {
        console.log(logTag, 'ending epic');
      })
    );
    return action$.pipe(
      filter(startActionCreator.isOfType),
      tap(action => {
        console.log(logTag, 'starting epic');
      }),
      mergeMap((action: WdkAction) =>
        epic(ActionsObservable.from(concat(of(action), action$)), state$, deps).pipe(
          tap(action => {
            console.log(logTag, 'action produced by epic in window', action);
          }),
          takeUntil(end$)
        ),
      ),
    );
  };
}

export function combineLatestIf<T>(s1: Observable<T>, pred: Pred<[T]>): Observable<[T]>;
export function combineLatestIf<T, T2>(s1: Observable<T>, s2: Observable<T2>, pred: Pred<[T, T2]>): Observable<[T, T2]>;
export function combineLatestIf<T, T2, T3>(s1: Observable<T>, s2: Observable<T2>, s3: Observable<T3>, pred: Pred<[T, T2, T3]>): Observable<[T, T2, T3]>;
export function combineLatestIf<T, T2, T3, T4>(s1: Observable<T>, s2: Observable<T2>, s3: Observable<T3>, s4: Observable<T4>, pred: Pred<[T, T2, T3, T4]>): Observable<[T, T2, T3, T4]>;
export function combineLatestIf<T, T2, T3, T4, T5>(s1: Observable<T>, s2: Observable<T2>, s3: Observable<T3>, s4: Observable<T4>, s5: Observable<T5>, pred: Pred<[T, T2, T3, T4, T5]>): Observable<[T, T2, T3, T4, T5]>;
export function combineLatestIf<T, T2, T3, T4, T5, T6>(s1: Observable<T>, s2: Observable<T2>, s3: Observable<T3>, s4: Observable<T4>, s5: Observable<T5>, s6: Observable<T6>, pred: Pred<[T, T2, T3, T4, T5, T6]>): Observable<[T, T2, T3, T4, T5, T6]>;
export function combineLatestIf<T, T2, T3, T4, T5, T6, T7>(s1: Observable<T>, s2: Observable<T2>, s3: Observable<T3>, s4: Observable<T4>, s5: Observable<T5>, s6: Observable<T6>, s7: Observable<T7>, pred: Pred<[T, T2, T3, T4, T5, T6, T7]>): Observable<[T, T2, T3, T4, T5, T6, T7]>;
export function combineLatestIf<T, T2, T3, T4, T5, T6, T7, T8>(s1: Observable<T>, s2: Observable<T2>, s3: Observable<T3>, s4: Observable<T4>, s5: Observable<T5>, s6: Observable<T6>, s7: Observable<T7>, s8: Observable<T8>, pred: Pred<[T, T2, T3, T4, T5, T6, T7, T8]>): Observable<[T, T2, T3, T4, T5, T6, T7, T8]>;
export function combineLatestIf<T>(sources: Array<Observable<T>>, pred: (values: T[]) => boolean): Observable<T[]>
export function combineLatestIf<T>(...args: Array<Observable<T> | Array<Observable<T>> | ((values: any) => boolean)>): Observable<T[]> {
  const pred = args[args.length - 1] as (values: T[]) => boolean;
  const rest = args.slice(0, -1);
  const sources = (
    rest.length === 1 && Array.isArray(rest[0])
      ? rest[0]
      : rest
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
        next: value => {
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
        error: error => observer.error(error),
        complete: () => {
          completedCount++;
          if (completedCount === sources.length) {
            observer.complete();
          }
        }
      });
    });
    // clean up logic to unsubscribe to source subscriptions
    return function unsubscribe() {
      subscriptions.forEach(s => s.unsubscribe());
    };
  });
}
