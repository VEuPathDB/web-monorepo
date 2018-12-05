import {concat, empty, of, Observable, combineLatest} from 'rxjs';
import {filter, mergeMap, startWith, takeUntil} from 'rxjs/operators';
import {Epic, StateObservable, ActionsObservable} from 'redux-observable';

import {Action as WdkAction} from 'wdk-client/Actions';
import {EpicDependencies, ModuleEpic} from 'wdk-client/Core/Store';

interface Action<Type extends string, Payload> {
  readonly type: Type;
  readonly payload: Payload;
}

export interface ActionCreator<Type extends string, Args extends any[], Payload> {
  readonly type: Type;
  (...args: Args): Action<Type, Payload>;
  isOfType: (action: { type: string }) => action is Action<Type, Payload>;
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


// The following overloads are so that we can capture type parameters for
// ActionCreators being passed.  Each overload specifies the length of the
// array of action creators accepted, which should also match the length of the
// array of actions accepted by `request2Fulfill`. Note that the elements in
// these arrays should correspond to one another by position.
//
// Add more overloads when needed.

// 1 request action
export function mapRequestActionsToEpic<
  T1 extends string,
  A1 extends any[],
  P1,
  State
>(
  actionCreators: [
    ActionCreator<T1, A1, P1>
  ],
  request2Fulfill: (
    requestActions: [
      Action<T1, P1>
    ],
    state$: StateObservable<State>,
    dependencies: EpicDependencies
  ) => Promise<WdkAction | undefined> | undefined
): ModuleEpic<State>;

// 2 request action
export function mapRequestActionsToEpic<
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
  request2Fulfill: (
    requestActions: [
      Action<T1, P1>,
      Action<T2, P2>
    ],
    state$: StateObservable<State>,
    dependencies: EpicDependencies
  ) => Promise<WdkAction | undefined> | undefined
): ModuleEpic<State>;

// 3 request action
export function mapRequestActionsToEpic<
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
  request2Fulfill: (
    requestActions: [
      Action<T1, P1>,
      Action<T2, P2>,
      Action<T3, P3>
    ],
    state$: StateObservable<State>,
    dependencies: EpicDependencies
  ) => Promise<WdkAction | undefined> | undefined
): ModuleEpic<State>;

// 4 request action
export function mapRequestActionsToEpic<
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
  request2Fulfill: (
    requestActions: [
      Action<T1, P1>,
      Action<T2, P2>,
      Action<T3, P3>,
      Action<T4, P4>
    ],
    state$: StateObservable<State>,
    dependencies: EpicDependencies
  ) => Promise<WdkAction | undefined> | undefined
): ModuleEpic<State>;

// 5 request action
export function mapRequestActionsToEpic<
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
  request2Fulfill: (
    requestActions: [
      Action<T1, P1>,
      Action<T2, P2>,
      Action<T3, P3>,
      Action<T4, P4>,
      Action<T5, P5>
    ],
    state$: StateObservable<State>,
    dependencies: EpicDependencies
  ) => Promise<WdkAction | undefined> | undefined
): ModuleEpic<State>;

// 6 request action
export function mapRequestActionsToEpic<
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
  request2Fulfill: (
    requestActions: [
      Action<T1, P1>,
      Action<T2, P2>,
      Action<T3, P3>,
      Action<T4, P4>,
      Action<T5, P5>,
      Action<T6, P6>
    ],
    state$: StateObservable<State>,
    dependencies: EpicDependencies
  ) => Promise<WdkAction | undefined> | undefined
): ModuleEpic<State>;

// 7 request action
export function mapRequestActionsToEpic<
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
  request2Fulfill: (
    requestActions: [
      Action<T1, P1>,
      Action<T2, P2>,
      Action<T3, P3>,
      Action<T4, P4>,
      Action<T5, P5>,
      Action<T6, P6>,
      Action<T7, P7>
    ],
    state$: StateObservable<State>,
    dependencies: EpicDependencies
  ) => Promise<WdkAction | undefined> | undefined
): ModuleEpic<State>;

// 8 request action
export function mapRequestActionsToEpic<
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
  request2Fulfill: (
    requestActions: [
      Action<T1, P1>,
      Action<T2, P2>,
      Action<T3, P3>,
      Action<T4, P4>,
      Action<T5, P5>,
      Action<T6, P6>,
      Action<T7, P7>,
      Action<T8, P8>
    ],
    state$: StateObservable<State>,
    dependencies: EpicDependencies
  ) => Promise<WdkAction | undefined> | undefined
): ModuleEpic<State>;

/**
 * Creates an Epic that calls `request2Fulfill` when actions matching the
 * supplied set of ActionCreators have been dispatched. `request2Fulfill` is
 * called when all of the actions have been dispatched, and when any of them
 * are dispatched thereafter.
 */
export function mapRequestActionsToEpic<State>(
  actionCreators: GenericActionCreator[],
  request2Fulfill: (...args: any[]) => Promise<WdkAction | undefined> | undefined,
): ModuleEpic<State> {
  return function mapRequestActionsEpic(
    action$: Observable<WdkAction>,
    state$: StateObservable<State>,
    dependencies: EpicDependencies,
  ) {
    const actionStreams = actionCreators.map(ac =>
      action$.pipe(filter(ac.isOfType)),
    );
    return combineLatest(actionStreams).pipe(
      mergeMap(actions => request2Fulfill(actions, state$, dependencies) || empty()),
      filter((action): action is WdkAction => action != null)
    );
  };
}

/**
 * Starts the target epic when `startAction` is emitted, until `endAction` is
 * emitted.
 */
export function takeEpicInWindow<State>(
  startAction: ActionCreator<string, any, any>,
  endAction: ActionCreator<string, any, any>,
  epic: ModuleEpic<State>,
): ModuleEpic<State> {
  return function takeUntilEpic(action$, state$, deps) {
    const end$ = action$.pipe(filter(endAction.isOfType));
    return action$.pipe(
      filter(startAction.isOfType),
      mergeMap((action: WdkAction) =>
        epic(ActionsObservable.from(concat(of(action), action$)), state$, deps).pipe(takeUntil(end$)),
      ),
    );
  };
}
