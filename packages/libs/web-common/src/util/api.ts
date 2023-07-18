import { mapValues, compose } from 'lodash/fp';
import {
  Decoder,
  standardErrorReport,
} from '@veupathdb/wdk-client/lib/Utils/Json';

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

export interface ApiRequestCreator<T, U extends any[] = any[]> {
  (...args: U): ApiRequest<T>;
}

export interface ApiRequestsObject<T = any, U extends any[] = any[]> {
  [Key: string]: ApiRequestCreator<T, U>;
}

type ApiRequestToBound<R extends ApiRequestCreator<any>> =
  R extends ApiRequestCreator<infer T, infer U>
    ? (...args: U) => Promise<T>
    : never;

export type BoundApiRequestsObject<T extends ApiRequestsObject> = {
  [P in keyof T]: T[P] extends ApiRequestCreator<infer A, infer B>
    ? (...args: B) => Promise<A>
    : never;
};

export function bindApiRequestCreators<T extends ApiRequestsObject>(
  requestCreators: T,
  handler: ApiRequestHandler
): BoundApiRequestsObject<T> {
  return mapValues(
    (requestCreator) => compose(handler, requestCreator),
    requestCreators
  ) as BoundApiRequestsObject<T>;
}

// XXX Not sure if these belong here, since they are specific to an ApiRequestHandler

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

/** Standard transformer that uses a `Json.ts` `decoder` type. */
export function standardTransformer<T>(decoder: Decoder<T>) {
  return async function transform(body: unknown): Promise<T> {
    const result = decoder(body);
    if (result.status === 'ok') return result.value;
    const report = `Expected ${result.expected}${
      result.context ? 'at _' + result.context : ''
    }, but got ${JSON.stringify(result.value)}.`;
    throw new Error('Could not decode response.\n' + report);
  };
}

/**
 * A function that takes an `ApiRequest<T>` and returns a `Promise<T>`.
 */
export interface ApiRequestHandler {
  <T>(request: ApiRequest<T>): Promise<T>;
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

/**
 * A `fetch`-based implentation of an `ApiRequestHandler`.
 */
export function createFetchApiRequestHandler(
  options: FetchApiOptions
): ApiRequestHandler {
  const { baseUrl, init = {}, fetchApi = window.fetch } = options;
  return async function fetchApiRequestHandler<T>(
    apiRequest: ApiRequest<T>
  ): Promise<T> {
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
    const response = await fetchApi(request);
    // TODO Make this behavior configurable
    if (response.ok) {
      const responseBody = await fetchResponseBody(response);

      return await transformResponse(responseBody);
    }
    throw new Error(
      `${response.status} ${response.statusText}${'\n'}${await response.text()}`
    );
  };
}

export abstract class FetchClient {
  protected readonly baseUrl: string;
  protected readonly init: RequestInit;
  protected readonly fetchApi: Window['fetch'];

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
