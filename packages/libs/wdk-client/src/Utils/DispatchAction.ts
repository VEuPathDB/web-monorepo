import Dispatcher from '../Core/State/Dispatcher';
import { Action, ActionCreatorResult, ActionCreatorServices, emptyType } from './ActionCreatorUtils';
import { isPromise } from './PromiseUtils';
import { alert } from './Platform';

/**
 * The DispatchAction type describes the type of function that is used to
 * dispatch actions.
 */
export type DispatchAction<T extends Action> = (action: ActionCreatorResult<T>) => ActionCreatorResult<T>;

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
export function getDispatchActionMaker(dispatcher: Dispatcher<Action>, services: ActionCreatorServices) {
  return function makeDispatchAction(channel: string) {
    if (channel === undefined) {
      console.warn("Call to makeDispatchAction() with no channel defined.");
    }

    const dispatchAction: DispatchAction<Action> = tryCatch(
      function dispatch(action: ActionCreatorResult<Action>) {
        if (typeof action === 'function') {
          return dispatchAction(action(services));
        }
        else if (isPromise(action)) {
          return action.then(result => dispatchAction(result)).then(undefined, logError);
        }
        else if (Array.isArray(action)) {
          return action.map(dispatchAction);
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
        // assign channel if requested
        action.channel = (action.isBroadcast ? undefined : channel);
        return dispatcher.dispatch(action);
      },
      function handleError(error: Error) {
        logError(error);
      }
    );

    return dispatchAction as DispatchAction<Action>;
  };

  function logError(error: Error) {
    console.error(error);
    services.wdkService.submitError(error).catch(err => {
      console.error('Could not submit error to log.', err);
    });
  }
}

function tryCatch<T extends Function>(fn: T, handleError: (error: Error) => any) {
  return (function tryCatchWrapper(...args: any[]) {
    try {
      return fn(...args)
    }
    catch(error) {
      return handleError(error);
    }
  });
}
