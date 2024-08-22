import { v4 as uuid } from 'uuid';

import {
  DelayedResultError as DelayedResultErrorInstance,
  isDelayedResultError,
} from '../Service/DelayedResultError';
import {
  ServiceError,
  isServerError,
  isClientError,
  isInputError,
  isServiceError,
} from '../Service/ServiceError';
import {
  ValidationBundle,
  makeErrorMessage as makeValidationBundleErrorMessage,
} from '../Service/ValidationBundle';
import { is } from './Json';

type ErrorType<Type, Instance> = {
  type: Type;
  message: string;
  id: string;
  error: Instance;
  info: unknown;
};

export type RuntimeError = ErrorType<'runtime', unknown>;
export type ValidationError = ErrorType<'validation', ValidationBundle>;
export type ServerError = ErrorType<'server', ServiceError>;
export type ClientError = ErrorType<'client', ServiceError>;
export type InputError = ErrorType<'input', ServiceError>;
export type DelayedResultError = ErrorType<
  'delayed-result',
  DelayedResultErrorInstance
>;

export type WdkError =
  | RuntimeError
  | ValidationError
  | ServerError
  | ClientError
  | InputError
  | DelayedResultError;

export function getTypedError(error: unknown, info?: unknown): WdkError {
  if (isServerError(error))
    return {
      type: 'server',
      message: 'Internal server error',
      id: error.logMarker,
      error,
      info,
    };
  if (isClientError(error)) {
    const validationBundle = parseJson(error.response);
    if (is(ValidationBundle, validationBundle)) {
      return {
        type: 'validation',
        message: makeValidationBundleErrorMessage(validationBundle),
        id: uuid(),
        error: validationBundle,
        info,
      };
    }
    return {
      type: 'client',
      message: error.response,
      id: error.logMarker,
      error,
      info,
    };
  }
  if (isInputError(error))
    return {
      type: 'input',
      message: error.response,
      id: error.logMarker,
      error,
      info,
    };
  if (isDelayedResultError(error))
    return {
      type: 'delayed-result',
      message: error.message,
      id: error.logMarker,
      error,
      info,
    };
  return {
    type: 'runtime',
    message:
      error instanceof Error ? error.message : String(error) || 'Unknown error',
    id: uuid(),
    error,
    info,
  };
}

export function makeCommonErrorMessage(error: unknown) {
  return getTypedError(error).message;
}

function parseJson(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    return undefined;
  }
}
