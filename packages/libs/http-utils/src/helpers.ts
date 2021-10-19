import { ApiRequest } from './FetchClient';

/** Helper to create a request with a JSON body. */
export function createJsonRequest<T>(init: ApiRequest<T>): ApiRequest<T> {
  return {
    ...init,
    body: JSON.stringify(init.body),
    headers: {
      ...init.headers,
      'Content-Type': 'application/json',
    },
  };
}

/** Helper to create a request with a plain text body. */
export function createPlainTextRequest<T>(init: ApiRequest<T>): ApiRequest<T> {
  return {
    ...init,
    headers: {
      ...init.headers,
      'Content-Type': 'text/plain',
    },
  };
}
