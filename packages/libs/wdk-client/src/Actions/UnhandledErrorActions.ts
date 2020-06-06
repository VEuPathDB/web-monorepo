import { v4 as uuid } from 'uuid';
import { makeActionCreator, InferAction } from "wdk-client/Utils/ActionCreatorUtils";
import { ServiceError, isServerError, isClientError, isInputError } from "wdk-client/Service/ServiceError";

export const notifyUnhandledError = makeActionCreator(
  'unhandled-error/notify',
  /** Since anything can be thrown, we have to expect anything. */
  (error: unknown) => ({ unhandledError: getTypedError(error) })
);

export const clearUnhandledErrors = makeActionCreator(
  'unhandled-error/clear'
);

export type Action = InferAction<
  | typeof notifyUnhandledError
  | typeof clearUnhandledErrors
>;

export type RuntimeError = { type: 'runtime', id: string, error: unknown }
export type ServerError = { type: 'server', id: string, error: ServiceError }
export type ClientError = { type: 'client', message: string, id: string, error: ServiceError }
export type InputError = { type: 'input', message: string, id: string, error: ServiceError }

export type UnhandledError =
  | RuntimeError
  | ServerError
  | ClientError
  | InputError


function getTypedError(error: unknown): UnhandledError {
  if (isServerError(error)) return { type: 'server', id: error.logMarker, error };
  if (isClientError(error)) return { type: 'client', message: error.response, id: error.logMarker, error };
  if (isInputError(error)) return { type: 'input', message: error.response, id: error.logMarker, error };
  return { type: 'runtime', id: uuid(), error };
}
