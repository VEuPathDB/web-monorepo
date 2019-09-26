import { Middleware } from 'redux';
import { isPromise } from 'wdk-client/Utils/PromiseUtils';
import { Action } from 'wdk-client/Actions';
import { PageTransitioner } from 'wdk-client/Utils/PageTransitioner';
import WdkService from 'wdk-client/Service/WdkService';

export interface ActionCreatorServices {
  wdkService: WdkService;
  transitioner: PageTransitioner;
}

export type ActionCreatorResult<T> =
  | T
  | ActionThunk<T>
  | ActionCreatorResultArray<T>
  | ActionCreatorResultPromise<T>;

interface ActionCreatorResultArray<T> extends Array<ActionCreatorResult<T>> {}

interface ActionCreatorResultPromise<T> extends Promise<ActionCreatorResult<T>> {}

export interface ActionThunk<T> {
  (services: ActionCreatorServices): ActionCreatorResult<T>;
}

// The following is used by thunks. When WdkMiddleware encounters this action,
// it will not be dispatched to the store. This allows a thunk to perform a
// side-effect without dispatching a specific action, for better or worse.
export const emptyType = Symbol('empty');

export type EmptyAction = {
  type: typeof emptyType
}

export const emptyAction: EmptyAction = {
  type: emptyType
}


/**
 * The DispatchAction type describes the type of function that is used to
 * dispatch actions.
 */
export type DispatchAction<T extends Action> = (action: ActionCreatorResult<T>) => ActionCreatorResult<T>;

type WdkMiddleWare = Middleware<DispatchAction<Action>>;


/**
 * Create a function that takes a channel and creates a dispatch function
 * `dispatchAction` that forwards calls to `dispatcher.dispatch` using the
 * channel as a scope for the audience of the action.
 *
 * In `dispatchAction`:
 *
 * If `action` is a function (i.e., a thunk), it will be called with `services`.
 * The return type of the function is the recursive type
 * `ActionCreatorResult<T>`, where `T` is the type of Action the function may
 * produce. `dispatchAction` will recursively unwrap the various types until an
 * action object is encountered, which will then be dispatched to the
 * `dispatcher`. If no action should be dispatched, use the special
 * `emptyAction` value.
 *
 * This design enforces that a value is always returned which makes error
 * handling more reliable.
 *
 * Note: In a previous design, the thunk was also passed the main dispatch
 * action and was expected to return void. This design encouraged promise
 * rejections to go unhandled, which made comprehensive error handling more
 * difficult.
 */
export const wdkMiddleware = (services: ActionCreatorServices): WdkMiddleWare => ({ dispatch }) => next => action => {
  try {
    if (typeof action === 'function') {
      return dispatch(action(services));
    }
    else if (isPromise<any>(action)) {
      return action.then(dispatch).then(undefined, logError);
    }
    else if (Array.isArray(action)) {
      return action.map(dispatch);
    }
    else if (action == null) {
      throw new Error("Action received is undefined or is null");
    }
    else if (action.type == null) {
      throw new Error("Action received does not have a `type` property.");
    }
    if (action.type === emptyType) {
      // nothing to dispatch, so bail
      return;
    }
    return next(action);
  }
  catch(error) {
    logError(error);
  }

  function logError(error: Error) {
    services.wdkService.submitError(error).catch(err => {
      console.error('Could not submit error to log.', err);
    });
  }

}

export const logger: WdkMiddleWare = store => next => action => {
  console.log('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  return result
}

declare module 'redux' {
  export interface Dispatch<A extends Action = AnyAction> {
    <T extends A>(action: ActionCreatorResult<T>): ActionCreatorResult<T>;
  }
}
