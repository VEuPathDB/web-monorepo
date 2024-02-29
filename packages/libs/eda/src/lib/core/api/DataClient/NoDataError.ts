export class NoDataError extends Error {
  name = 'NoDataError';
  constructor(
    message: string,
    public response: string,
    public status: number,
    public logMarker: string
  ) {
    super(message);
  }
}
