import { makeActionCreator, InferAction } from '../Utils/ActionCreatorUtils';
import { WdkError, getTypedError } from '../Utils/Errors';

export const notifyUnhandledError = makeActionCreator(
  'unhandled-error/notify',
  /** Since anything can be thrown, we have to expect anything. */
  (error: unknown, info?: unknown) => ({
    unhandledError: getTypedError(error, info),
  })
);

export const clearUnhandledErrors = makeActionCreator('unhandled-error/clear');

export type Action = InferAction<
  typeof notifyUnhandledError | typeof clearUnhandledErrors
>;

export type UnhandledError = WdkError;
