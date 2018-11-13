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
import { EpicDependencies } from 'wdk-client/Core/Store';

import { from, Observable } from 'rxjs';
import { Action as WdkAction } from 'wdk-client/Actions';
import { filter, mergeMap } from 'rxjs/operators';
import {StateObservable} from 'redux-observable';


export function mapRequestActionToEpic<RequestActionType extends string, Args extends any[], Payload, State>(actionCreator: ActionCreator<RequestActionType, Args, Payload>, request2Fulfill: (requestAction: InferAction<typeof actionCreator>, state$: StateObservable<State>, dependencies: EpicDependencies) => Promise<WdkAction>  )  {
  return (action$: Observable<WdkAction>, state$: StateObservable<State>, dependencies: EpicDependencies  ): Observable<WdkAction> => action$.pipe(
    filter(actionCreator.isOfType),
    mergeMap((action) => from(request2Fulfill(action, state$, dependencies)))
)  
}

