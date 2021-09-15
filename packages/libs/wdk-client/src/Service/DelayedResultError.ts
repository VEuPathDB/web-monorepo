export class DelayedResultError extends Error {
  name = 'DelayedResultError'
  constructor(
    message: string,
    public logMarker: string
  ) {
    super(message);
  }
}

export function isDelayedResultError(error: unknown): error is DelayedResultError {
  return error instanceof Error && error.name === 'DelayedResultError';
}
