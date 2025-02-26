export const noDataMessage =
  'The visualization cannot be made because no data remains after filtering.';

export class NoDataError extends Error {
  name = 'NoDataError';
  constructor(
    message: string = noDataMessage,
    public response: string,
    public status: number,
    public logMarker: string
  ) {
    super(message);
  }
}
