import { Middleware } from 'redux';
import { isPromise } from '../Utils/PromiseUtils';
import { Action } from '../Actions';
import { notifyUnhandledError } from '../Actions/UnhandledErrorActions';
import { EpicDependencies } from '../Core/Store';

export type ActionCreatorServices = EpicDependencies;

export type ActionCreatorResult<
  T,
  S extends ActionCreatorServices = ActionCreatorServices
> =
  | T
  | ActionThunk<T, S>
  | ActionCreatorResultArray<T, S>
  | ActionCreatorResultPromise<T, S>;

interface ActionCreatorResultArray<
  T,
  S extends ActionCreatorServices = ActionCreatorServices
> extends Array<ActionCreatorResult<T, S>> {}

interface ActionCreatorResultPromise<
  T,
  S extends ActionCreatorServices = ActionCreatorServices
> extends Promise<ActionCreatorResult<T, S>> {}

export interface ActionThunk<
  T,
  S extends ActionCreatorServices = ActionCreatorServices
> {
  (services: S): ActionCreatorResult<T>;
}

// The following is used by thunks. When WdkMiddleware encounters this action,
// it will not be dispatched to the store. This allows a thunk to perform a
// side-effect without dispatching a specific action, for better or worse.
export const emptyType = Symbol('empty');

export type EmptyAction = {
  type: typeof emptyType;
};

export const emptyAction: EmptyAction = {
  type: emptyType,
};

/**
 * The DispatchAction type describes the type of function that is used to
 * dispatch actions.
 */
export type DispatchAction<
  T extends Action,
  S extends ActionCreatorServices = ActionCreatorServices
> = (action: ActionCreatorResult<T, S>) => ActionCreatorResult<T, S>;

type WdkMiddleWare<S extends ActionCreatorServices = ActionCreatorServices> =
  Middleware<DispatchAction<Action, S>>;

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
export const wdkMiddleware =
  <S extends ActionCreatorServices>(services: S): WdkMiddleWare<S> =>
  ({ dispatch }) =>
  (next) =>
  (action) => {
    try {
      if (typeof action === 'function') {
        return dispatch(action(services));
      } else if (isPromise<any>(action)) {
        return action.then(dispatch).then(undefined, logError);
      } else if (Array.isArray(action)) {
        return action.map(dispatch);
      } else if (action == null) {
        throw new Error('Action received is undefined or is null');
      } else if (action.type == null) {
        throw new Error('Action received does not have a `type` property.');
      }
      if (action.type === emptyType) {
        // nothing to dispatch, so bail
        return;
      }
      return next(action);
    } catch (error) {
      logError(error);
    }

    function logError(error: Error) {
      dispatch(notifyUnhandledError(error));
    }
  };

export const logger: WdkMiddleWare = (store) => (next) => (action) => {
  console.log('dispatching', action);
  let result = next(action);
  console.log('next state', store.getState());
  return result;
};

declare module 'redux' {
  export interface Dispatch<
    A extends Action = AnyAction,
    B extends ActionCreatorServices = ActionCreatorServices
  > {
    <T extends A, S extends B>(
      action: ActionCreatorResult<T, S>
    ): ActionCreatorResult<T, S>;
  }
}
