export class ServiceError extends Error {
  constructor(
    message: string,
    public response: string,
    public status: number
  ) {
    super(message);
  }

  toString() {
    return super.toString() + ': ' + this.response;
  }
}
