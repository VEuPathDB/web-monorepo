import { v4 as uuid } from 'uuid';
import { makeActionCreator, InferAction } from "wdk-client/Utils/ActionCreatorUtils";
import { ServiceError, isServerError, isClientError, isInputError } from "wdk-client/Service/ServiceError";

export const notifyUnhandledError = makeActionCreator(
  'unhandled-error/notify',
  /** Since anything can be thrown, we have to expect anything. */
  (error: unknown, info?: unknown) => ({ unhandledError: getTypedError(error, info) })
);

export const clearUnhandledErrors = makeActionCreator(
  'unhandled-error/clear'
);

export type Action = InferAction<
  | typeof notifyUnhandledError
  | typeof clearUnhandledErrors
>;

type ErrorType<Type, Instance> = {
  type: Type;
  message: string;
  id: string;
  error: Instance;
  info: unknown;
}

export type RuntimeError = ErrorType<'runtime', unknown>;
export type ServerError = ErrorType<'server', ServiceError>;
export type ClientError = ErrorType<'client', ServiceError>;
export type InputError = ErrorType<'input', ServiceError>;

export type UnhandledError =
  | RuntimeError
  | ServerError
  | ClientError
  | InputError


function getTypedError(error: unknown, info?: unknown): UnhandledError {
  if (isServerError(error)) return { type: 'server', message: 'Internal server error', id: error.logMarker, error, info };
  if (isClientError(error)) return { type: 'client', message: error.response, id: error.logMarker, error, info };
  if (isInputError(error)) return { type: 'input', message: error.response, id: error.logMarker, error, info };
  return { type: 'runtime', message: 'Runtime error', id: uuid(), error, info };
}
