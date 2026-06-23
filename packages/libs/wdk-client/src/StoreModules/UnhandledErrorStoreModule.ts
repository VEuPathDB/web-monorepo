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
  const messagesToIgnore = [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'empty textures are not allowed',
  ];
  return messagesToIgnore.some((messageToIgnore) =>
    message.includes(messageToIgnore)
  );
}

/**
 * Checks if an error originates from a browser extension or third-party script.
 * Returns true if the error should be filtered out (not reported).
 */
function isThirdPartyError(error: Error | string, filename?: string): boolean {
  // Extension URL patterns
  const extensionProtocols = [
    'chrome-extension://',
    'moz-extension://',
    'safari-extension://',
    'safari-web-extension://',
  ];

  // Check if filename contains extension protocol
  if (filename) {
    if (extensionProtocols.some((protocol) => filename.includes(protocol))) {
      return true;
    }
    // Filter errors from non-same-origin sources
    // Errors from our app should have relative paths or our domain
    if (
      filename.startsWith('http') &&
      !filename.includes(window.location.hostname)
    ) {
      return true;
    }
  }

  // Check error stack trace for extension URLs
  if (error instanceof Error && error.stack) {
    if (
      extensionProtocols.some((protocol) => error.stack!.includes(protocol))
    ) {
      return true;
    }
  }

  // Check error message for extension-related patterns
  const errorMessage = error instanceof Error ? error.message : String(error);
  if (extensionProtocols.some((protocol) => errorMessage.includes(protocol))) {
    return true;
  }

  // Common patterns from browser extensions
  const extensionPatterns = [
    '__firefox__',
    '__chrome__',
    '__safari__',
    'webkit-masked-url',
  ];
  if (extensionPatterns.some((pattern) => errorMessage.includes(pattern))) {
    return true;
  }

  return false;
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
      return (
        !ignoreError(String(event.reason)) &&
        !isThirdPartyError(event.reason) &&
        !wdkService.getIsInvalidating()
      );
    }),
    map((event: PromiseRejectionEvent) => notifyUnhandledError(event.reason))
  );
  // map unhandled errors to unhandledError action
  const error$: Observable<Action> = fromEvent<ErrorEvent>(
    window,
    'error'
  ).pipe(
    filter((event: ErrorEvent) => {
      return (
        !ignoreError(event.message) &&
        !isThirdPartyError(event.error ?? event.message, event.filename) &&
        !wdkService.getIsInvalidating()
      );
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
