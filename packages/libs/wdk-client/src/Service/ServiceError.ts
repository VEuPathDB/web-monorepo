export class ServiceError extends Error {
  name = 'ServiceError';
  constructor(
    message: string,
    public response: string,
    public status: number,
    public logMarker: string
  ) {
    super(`${message}: ${response}`);
  }
}

export function isServiceError(error: unknown): error is ServiceError {
  return error instanceof Error && error.name === 'ServiceError';
}

export function isServerError(error: unknown): error is ServiceError {
  return isServiceError(error) && error.status >= 500;
}

export function isClientError(error: unknown): error is ServiceError {
  return isServiceError(error) && error.status !== 422 && error.status >= 400 && error.status < 500;
}

export function isInputError(error: unknown): error is ServiceError {
  return isServiceError(error) && error.status === 422;
}

