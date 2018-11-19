interface Action<Type extends string, Payload> {
  readonly type: Type;
  readonly payload: Payload;
}

interface ActionCreator<Type extends string, Args extends any[], Payload> {
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
import { EpicDependencies, ModuleEpic } from 'wdk-client/Core/Store';

import { empty, Observable, combineLatest } from 'rxjs';
import { Action as WdkAction } from 'wdk-client/Actions';
import { filter, mergeMap } from 'rxjs/operators';
import {StateObservable} from 'redux-observable';


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
