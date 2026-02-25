export const DELAYED_RESULT_MESSAGE =
  'Your results are not yet available. Please return to this page later.';

export class DelayedResultError extends Error {
  name = 'DelayedResultError';
  constructor(_message: string, public logMarker: string) {
    super(DELAYED_RESULT_MESSAGE);
  }
}

export function isDelayedResultError(
  error: unknown
): error is DelayedResultError {
  return error instanceof Error && error.name === 'DelayedResultError';
}
