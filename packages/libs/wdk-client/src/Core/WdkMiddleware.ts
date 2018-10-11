import { Middleware } from 'redux';
import { Action, ActionCreatorResult, ActionCreatorServices, emptyType } from '../Utils/ActionCreatorUtils';
import { isPromise } from '../Utils/PromiseUtils';

/**
 * The DispatchAction type describes the type of function that is used to
 * dispatch actions.
 */
export type DispatchAction<T extends Action> = (action: ActionCreatorResult<T>) => ActionCreatorResult<T>;

declare module 'redux' {
  export interface Dispatch<A extends Action = AnyAction> {
    <T extends A>(action: ActionCreatorResult<T>): ActionCreatorResult<T>;
  }
}



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
export const wdkMiddleware = (services: ActionCreatorServices): Middleware<DispatchAction<Action>> => ({ dispatch }) => next => action => {
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
    console.error(error);
    services.wdkService.submitError(error).catch(err => {
      console.error('Could not submit error to log.', err);
    });
  }

}
