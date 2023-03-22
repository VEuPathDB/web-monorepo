import { v4 as uuid } from 'uuid';

/*
 * An "Api" is an abstraction for interacting with resources.
 *
 * There are two primary interfaces: `ApiRequest` and `ApiRequestHandler`.
 *
 * An `ApiRequest` represents a HTTP-like request for a resource.
 *
 * An `ApiRequestHandler` represents an implentation that can handle a request.
 * Typically this will be based on the `fetch` API.
 */

/**
 * Represents an HTTP-like request for a resource.
 */
export interface ApiRequest<T> {
  /** Path to resource, relative to a fixed base url. */
  path: string;
  /** Request method for resource. */
  method: string;
  /** Body of request */
  body?: any;
  /** Headers to add to the request. */
  headers?: Record<string, string>;
  /** Transform response body. This is a good place to do validation. */
  transformResponse: (body: unknown) => Promise<T>;
}

/**
 * Options for a `fetch`-based request handler.
 */
export interface FetchApiOptions {
  /** Base url for service endpoint. */
  baseUrl: string;
  /** Global optoins for all requests. */
  init?: RequestInit;
  /** Implementation of `fetch` function. Defaults to `window.fetch`. */
  fetchApi?: Window['fetch'];
}

export abstract class FetchClient {
  protected readonly baseUrl: string;
  protected readonly init: RequestInit;
  protected readonly fetchApi: Window['fetch'];
  // Subclasses can set this to false to disable including a traceparent header with all requests.
  protected readonly includeTraceidHeader: boolean = true;

  constructor(options: FetchApiOptions) {
    this.baseUrl = options.baseUrl;
    this.init = options.init ?? {};
    this.fetchApi = options.fetchApi ?? window.fetch;
  }

  protected async fetch<T>(apiRequest: ApiRequest<T>): Promise<T> {
    const { baseUrl, init, fetchApi } = this;
    const { transformResponse, path, body, ...restReq } = apiRequest;
    const request = new Request(baseUrl + path, {
      ...init,
      ...restReq,
      body: body,
      headers: {
        ...restReq.headers,
        ...init.headers,
      },
    });
    if (this.includeTraceidHeader) {
      request.headers.set('traceid', generateTraceidHeaderValue());
    }
    const response = await fetchApi(request);
    // TODO Make this behavior configurable
    if (response.ok) {
      const responseBody = await fetchResponseBody(response);

      return await transformResponse(responseBody);
    }
    throw new Error(
      `${response.status} ${response.statusText}${'\n'}${await response.text()}`
    );
  }
}

async function fetchResponseBody(response: Response) {
  const contentType = response.headers.get('Content-Type');

  return contentType == null
    ? undefined
    : contentType.startsWith('application/json')
    ? response.json()
    : response.text();
}

function generateTraceidHeaderValue() {
  const traceId = uuid().replaceAll('-', '');
  return traceId;
}
