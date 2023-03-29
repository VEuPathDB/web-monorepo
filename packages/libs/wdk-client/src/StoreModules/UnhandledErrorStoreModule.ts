import { Action } from '../Actions';
import { ActionsObservable, StateObservable } from 'redux-observable';
import { Observable, EMPTY, fromEvent, merge } from 'rxjs';
import { filter, tap, mergeMapTo, map, mapTo } from 'rxjs/operators';
import {
  notifyUnhandledError,
  clearUnhandledErrors,
  UnhandledError,
} from '../Actions/UnhandledErrorActions';
import { RootState } from '../Core/State/Types';
import { EpicDependencies } from '../Core/Store';
import { updateLocation } from '../Actions/RouterActions';

export const key = 'unhandledErrors';

export interface State {
  errors: UnhandledError[];
}

const initialState: State = {
  errors: [],
};

export function reduce(state: State = initialState, action: Action): State {
  switch (action.type) {
    case notifyUnhandledError.type:
      return {
        ...state,
        errors: [...state.errors, action.payload.unhandledError],
      };
    case clearUnhandledErrors.type:
      return {
        errors: [],
      };
    default:
      return state;
  }
}

// TODO Allow this to be configured by .. consumer
function ignoreError(message: string): boolean {
  return /ResizeObserver loop limit exceeded/.test(message);
}

export function observe(
  action$: ActionsObservable<Action>,
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Observable<Action> {
  // map unhandled promise rejections to unhandledError action
  const rejection$: Observable<Action> = fromEvent<PromiseRejectionEvent>(
    window,
    'unhandledrejection'
  ).pipe(
    filter((event: PromiseRejectionEvent) => {
      return !ignoreError(String(event.reason));
    }),
    map((event: PromiseRejectionEvent) => notifyUnhandledError(event.reason))
  );
  // map unhandled errors to unhandledError action
  const error$: Observable<Action> = fromEvent<ErrorEvent>(
    window,
    'error'
  ).pipe(
    filter((event: ErrorEvent) => {
      return !ignoreError(event.message);
    }),
    map((event: ErrorEvent) => {
      return notifyUnhandledError(event.error ?? event.message);
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
    tap(async (action) => {
      try {
        const {
          unhandledError: { error, id, info },
        } = action.payload;
        console.error(error);
        await wdkService.submitErrorIfNot500(
          error instanceof Error ? error : new Error(String(error)),
          { id, info }
        );
      } catch (error) {
        console.error('Error logging request failed:', error);
      }
    }),
    mergeMapTo(EMPTY)
  );
  return merge(rejection$, error$, clear$, notify$);
}
