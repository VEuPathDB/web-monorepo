export const appendUrlAndRethrow = (url: string) => (error: unknown) => {
  if (error instanceof Error) {
    const { message } = error;
    error.message = !message.endsWith('.')
      ? `${message}: [attempting to request ${url}]`
      : `${message} (Attempting to request ${url}.)`;
  }
  throw error;
}
