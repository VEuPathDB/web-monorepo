import { Action } from 'wdk-client/Actions';
import { ActionsObservable, StateObservable } from 'redux-observable';
import { Observable, EMPTY, fromEvent, merge } from 'rxjs';
import { filter, tap, mergeMapTo, map, mapTo } from 'rxjs/operators';
import { notifyUnhandledError, clearUnhandledErrors } from 'wdk-client/Actions/UnhandledErrorActions';
import { RootState } from 'wdk-client/Core/State/Types';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { updateLocation } from 'wdk-client/Actions/RouterActions';

export const key = 'unhandledErrors';

export interface State {
  errors: any[]
}

const initialState: State = {
  errors: []
}

export function reduce(state: State = initialState, action: Action): State {
  switch(action.type) {
    case notifyUnhandledError.type:
      return {
        ...state,
        errors: [ ...state.errors, action.payload.error ]
      }
    case clearUnhandledErrors.type:
      return {
        errors: []
      };
    default:
      return state;
  }
}

export function observe(action$: ActionsObservable<Action>, state$: StateObservable<RootState>, { wdkService }: EpicDependencies): Observable<Action> {
  // map unhandled promise rejections to unhandledError action
  const rejection$: Observable<Action> = fromEvent(window, 'unhandledrejection').pipe(
    map((event: PromiseRejectionEvent) => notifyUnhandledError(event.reason))
  );
  // map unhandled errors to unhandledError action
  const error$: Observable<Action> = fromEvent(window, 'error').pipe(
    map((event: ErrorEvent) => {
      return notifyUnhandledError(event.error)
    })
  );
  // clear errors when route changes
  const clear$: Observable<Action> = action$.pipe(
    filter(updateLocation.isOfType),
    mapTo(clearUnhandledErrors())
  );
  // log errors as they come in
  const notify$: Observable<never> = action$.pipe(
    filter(notifyUnhandledError.isOfType),
    tap(action => {
      const { error } = action.payload;
      wdkService.submitErrorIfNot500(error instanceof Error ? error : new Error(String(error)));
    }),
    mergeMapTo(EMPTY),

  );
  return merge(rejection$, error$, clear$, notify$);
}
