import {
  ContainerCoreErrorCodes,
  ServerErrorBody,
  SimpleServiceErrorBody,
  ValidationErrorBody,
} from '../responses/shared/error-responses';

type ErrorResponse =
  | SimpleServiceErrorBody
  | ServerErrorBody
  | ValidationErrorBody
  ;

export const isNonErrorResponse = <T>(body: T | ErrorResponse): body is T => {
  if (!body || typeof body !== 'object') {
    return true;
  }

  if (!('status' in body)) {
    return true;
  }

  if (typeof body.status !== 'string') {
    return true;
  }

  return Object.values(ContainerCoreErrorCodes).includes(body.status);
};