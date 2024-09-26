import localforage from 'localforage';
import { keyBy, memoize, once } from 'lodash';
import * as QueryString from 'querystring';
import { v4 as uuid } from 'uuid';
import { expandedRecordClassDecoder } from '../Service/Decoders/RecordClassDecoders';
import {
  DelayedResultError,
  isDelayedResultError,
} from '../Service/DelayedResultError';
import { ServiceError, isServerError } from '../Service/ServiceError';
import { fetchWithRetry } from '../Utils/FetchWithRetry';
import * as Decode from '../Utils/Json';
import { alert } from '../Utils/Platform';
import { pendingPromise } from '../Utils/PromiseUtils';
import { Question } from '../Utils/WdkModel';
import { appendUrlAndRethrow, makeTraceid } from './ServiceUtils';

/**
 * Header added to service requests to indicate the version of the model
 * current stored in cache.
 */
export const CLIENT_WDK_VERSION_HEADER = 'x-client-wdk-timestamp';

/**
 * Response text returned by service that indicates the version of the cached
 * model is stale, based on CLIENT_WDK_VERSION_HEADER.
 */
export const CLIENT_OUT_OF_SYNC_TEXT = 'WDK-TIMESTAMP-MISMATCH';

/**
 * Response returned by service that indicates that the requested
 * resource is not yet available.
 */
export type DelayedResult = Decode.Unpack<typeof delayedResult>;
const delayedResult = Decode.record({
  status: Decode.constant('accepted'),
  message: Decode.constant('WDK-DELAYED-RESULT'),
});

export interface StandardWdkPostResponse {
  id: number;
}

type RequestOptions<Resource> = {
  /** Request method */
  method: string;
  /** Path to the resource, relative to the base url */
  path: string;
  /** Query params to include with request */
  params?: { [key: string]: any };
  /** Request body */
  body?: string;
  /** Fetch from cache, if available */
  useCache?: boolean;
  /**
   * Optional identity for cache. If useCache is true, and this is omitted, then
   * a combination of the resource path and any provided params will be used as
   * the cache key. If this is also included, this value will be appended to the
   * generated cache key.
   */
  cacheId?: string;
  /** If using cache and a value is present, this is a check for the cached value */
  checkCachedValue?: (resource: Resource) => boolean;
};

export interface ServiceConfig {
  authentication: {
    method: 'OAUTH2' | 'USER_DB';
    oauthUrl: string;
    oauthClientUrl: string;
    oauthClientId: string;
  };
  buildNumber: string;
  categoriesOntologyName: string;
  description: string;
  displayName: string;
  projectId: string;
  releaseDate: string;
  startupTime: number;
  userProfileProperties: Array<{
    name: string;
    displayName: string;
    inputType: 'text' | 'textbox' | 'select';
    help?: string;
    suggest?: string;
    isRequired: boolean;
    isPublic: boolean;
  }>;
}

const configDecoder: Decode.Decoder<ServiceConfig> = Decode.record({
  authentication: Decode.record({
    method: Decode.oneOf(Decode.constant('OAUTH2'), Decode.constant('USER_DB')),
    oauthUrl: Decode.string,
    oauthClientUrl: Decode.string,
    oauthClientId: Decode.string,
  }),
  buildNumber: Decode.string,
  categoriesOntologyName: Decode.string,
  description: Decode.string,
  displayName: Decode.string,
  projectId: Decode.string,
  releaseDate: Decode.string,
  startupTime: Decode.number,
  userProfileProperties: Decode.arrayOf(
    Decode.record({
      name: Decode.string,
      displayName: Decode.string,
      inputType: Decode.oneOf(
        Decode.constant('text'),
        Decode.constant('textbox'),
        Decode.constant('select')
      ),
      help: Decode.optional(Decode.string),
      suggest: Decode.optional(Decode.string),
      isRequired: Decode.boolean,
      isPublic: Decode.boolean,
    })
  ),
});

export type ServiceBase = ReturnType<typeof ServiceBase>;

/**
 * A helper to request resources from a Wdk REST Service.
 * @param {string} serviceUrl Base url for Wdk REST Service.
 */
export const ServiceBase = (serviceUrl: string) => {
  /** Cross-session persistence */
  const _store: LocalForage = localforage.createInstance({
    name: 'WdkService/' + serviceUrl,
  });
  /** In-memory persistence */
  const _cache: Map<string, Promise<any>> = new Map();

  /** WdkService "version" number */
  let _version: number | undefined;
  /** Indicates if the cache is being invalidated */
  let _isInvalidating = false;
  /** Indicates if a network request has been made */
  let _hasRequestBeenMade = false;

  /**
   * Get the configuration for the Wdk REST Service that resides at the given base url.
   */
  function getConfig(): Promise<ServiceConfig> {
    return sendRequest(configDecoder, {
      method: 'get',
      path: '/',
      useCache: true,
      cacheId: 'config',
    });
  }

  const getUserProfileVocabulary = once(
    async function getUserProfileVocabulary() {
      const decoder = Decode.objectOf(Decode.arrayOf(Decode.string));
      const config = await getConfig();
      const vocabUrl =
        config.authentication.oauthUrl + '/assets/public/profile-vocabs.json';
      const response = await fetch(vocabUrl, {
        mode: 'cors',
        credentials: 'include',
      });
      const json = await response.json();
      const result = decoder(json);
      if (result.status === 'err')
        throw new Error('Unexpected backend type from ' + vocabUrl);
      return result.value;
    }
  );

  /**
   * Send a request to a resource of the Wdk REST Service, and returns a Promise
   * that will fulfill with the response, or reject with a ServiceError.
   *
   * @param options Options for request.
   * @param options.method The request method to use.
   * @param options.path The path of the resource, relative to the root url.
   * @param options.params? Query params to include with request.
   * @param options.body? The request body
   * @param options.useCache? Indicate if resource should be fetched from cache.
   *    This cache is invalidated whenever the REST Service application is restarted.
   *    The resource's url and any query params are used to generate a cache key.
   * @param options.cacheId? Additional string to use for cache key. This is useful
   *    for POST requests that are semantically treated as GET requests.
   * @param options.checkCachedValue? If present this function is called on a cached value,
   *    which is then only returned if the call returns true.
   * @return {Promise<Resource>}
   */
  function sendRequest<Resource>(
    decoder: Decode.Decoder<Resource>,
    options: RequestOptions<Resource>
  ): Promise<Resource> {
    let { method, path, params, body, useCache, cacheId, checkCachedValue } =
      options;
    method = method.toUpperCase();
    let url =
      path + (params == null ? '' : '?' + QueryString.stringify(params));
    // Technically, only GET should be cache-able, but some resources treat POST
    // as GET, so we will allow it.
    if (useCache && (method === 'GET' || method === 'POST')) {
      let cacheKey = url + (cacheId == null ? '' : '__' + cacheId);
      return _getFromCache(
        cacheKey,
        () => sendRequest(decoder, { ...options, useCache: false }),
        checkCachedValue
      );
    }
    return _fetchJson(method, url, body).then((resp) => {
      const result = decoder(resp);
      if (result.status === 'ok') return result.value;

      // This is an error we always want to submit to service. Typically,
      // WdkService consumers will catch errors and show a message to users
      // that something went wrong. We want to make sure that this error also
      // makes it to the client error log on the server.
      let errorMessage = `Could not decode resource from ${options.path}:`;
      if (result.context) {
        errorMessage += '\n\n' + `  Problem at _${result.context}:`;
      }

      errorMessage +=
        '\n\n' +
        `    Expected ${result.expected}, but got ${JSON.stringify(
          result.value
        )}.`;

      const err = Error(errorMessage);
      submitError(err);
      console.error(err);
      throw err;
    });
  }

  function submitError(error: Error, extra?: any) {
    const { name, message, stack } = error;
    console.group('Client error log');
    console.error(error);
    console.groupEnd();
    return _initializeStore().then(() =>
      sendRequest(Decode.none, {
        method: 'post',
        path: '/client-errors',
        body: JSON.stringify({ name, message, stack, extra }),
      })
    );
  }

  async function submitErrorIfNot500(error: Error, extra?: any): Promise<void> {
    if (isServerError(error)) return;
    return submitError(error, extra);
  }

  async function submitErrorIfUndelayedAndNot500(
    error: Error,
    extra?: any
  ): Promise<void> {
    if (isDelayedResultError(error)) return;
    return submitErrorIfNot500(error, extra);
  }

  async function _fetchJson<T>(
    method: string,
    url: string,
    body?: string,
    isBaseUrl?: boolean
  ) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      traceid: makeTraceid(),
    });
    headers.append(CLIENT_WDK_VERSION_HEADER, String(await _initializeStore()));
    return fetchWithRetry(1, isBaseUrl ? url : serviceUrl + url, {
      headers,
      method: method.toUpperCase(),
      body: body,
      credentials: 'include',
    })
      .then((response) => {
        let hasRequestBeenMade = _hasRequestBeenMade;
        _hasRequestBeenMade = true;
        if (_isInvalidating) {
          return pendingPromise as Promise<T>;
        }

        if (response.ok) {
          if (response.status === 204) {
            return undefined;
          }

          return response.json().then((json) => {
            const delayedResultValidation = delayedResult(json);

            // If the response is that of a delayed result, throw a DelayedResultError
            if (delayedResultValidation.status === 'ok') {
              throw new DelayedResultError(
                'We are still processing your result. Please return to this page later.',
                response.headers.get('x-log-marker') ?? uuid()
              );
            }

            // Otherwise, return the parsed JSON as-is for further processing
            return json;
          });
        }

        return response.text().then((text) => {
          if (response.status === 409 && text === CLIENT_OUT_OF_SYNC_TEXT) {
            if (!_isInvalidating) {
              _isInvalidating = true;
              _store
                .clear()
                .then(() => {
                  if (hasRequestBeenMade) {
                    return alert(
                      'Reload page',
                      'This page is no longer valid and will be reloaded.'
                    );
                  }
                })
                .then(() => {
                  window.location.reload();
                });
              return pendingPromise as Promise<T>;
            }
          }

          // FIXME Get uuid from response header when available
          throw new ServiceError(
            `Cannot ${method.toUpperCase()} ${url} (${response.status})`,
            text,
            response.status,
            response.headers.get('x-log-marker') || uuid()
          );
        });
      })
      .catch(appendUrlAndRethrow(serviceUrl + url)) as Promise<T>;
  }

  /**
   * Checks cache for item associated to key. If item is not in cache, then
   * call onCacheMiss callback and set the resolved value in the cache.
   */
  function _getFromCache<T>(
    key: string,
    onCacheMiss: () => Promise<T>,
    checkCachedValue = (cachedValue: T) => true
  ) {
    if (!_cache.has(key)) {
      let cacheValue$ = _initializeStore()
        .then(() => _store.getItem<T>(key))
        .then((storeItem) => {
          if (storeItem != null && checkCachedValue(storeItem))
            return storeItem;
          return onCacheMiss().then((item) => {
            return _store.setItem(key, item).catch((err) => {
              console.error(
                'Unable to store WdkService item with key `' + key + '`.',
                err
              );
              return item;
            });
          });
        });
      _cache.set(key, cacheValue$);
    }
    return <Promise<T>>_cache.get(key);
  }

  /**
   * Set the store version
   */
  const _initializeStore = once(function _initializeStore() {
    return _store
      .getItem<ServiceConfig>('/__config')
      .then((storeConfig) => {
        if (storeConfig == null) {
          return fetchWithRetry(1, serviceUrl)
            .then((response) => {
              if (!response.ok) {
                console.error(
                  `Fetching ${serviceUrl} failed for _initializeStore: ${response.statusText}`
                );
                throw new Error('Failed to initialize service');
              }
              return response.json();
            })
            .then((serviceConfig: ServiceConfig) => {
              return _store
                .setItem('/__config', serviceConfig)
                .then(() => serviceConfig);
            });
        }
        return storeConfig;
      })
      .then((config) => {
        _version = config.startupTime;
        return _version;
      });
  });

  function _clearCache() {
    return _store.clear();
  }

  async function getVersion() {
    const { startupTime } = await getConfig();
    return startupTime;
  }

  function getRecordTypesPath() {
    return '/record-types';
  }

  function getRecordTypePath(recordClassUrlSegment: string) {
    return getRecordTypesPath() + '/' + recordClassUrlSegment;
  }

  function getSearchesPath(recordClassUrlSegment: string) {
    return getRecordTypePath(recordClassUrlSegment) + '/searches';
  }

  function getSearchPath(
    recordClassUrlSegment: string,
    questionUrlSegment: string
  ) {
    return getSearchesPath(recordClassUrlSegment) + '/' + questionUrlSegment;
  }

  function getReportsPath(
    recordClassUrlSegment: string,
    questionUrlSegment: string
  ) {
    return getSearchesPath(recordClassUrlSegment) + '/' + questionUrlSegment;
  }

  function getReportsEndpoint(
    recordClassUrlSegment: string,
    questionUrlSegment: string
  ) {
    return getReportsPath(recordClassUrlSegment, questionUrlSegment);
  }

  function getStandardSearchReportEndpoint(
    recordClassUrlSegment: string,
    questionUrlSegment: string
  ) {
    return (
      getReportsEndpoint(recordClassUrlSegment, questionUrlSegment) +
      '/reports/standard'
    );
  }

  function getCustomSearchReportEndpoint(
    recordClassUrlSegment: string,
    questionUrlSegment: string,
    reportName: string
  ) {
    return (
      getReportsEndpoint(recordClassUrlSegment, questionUrlSegment) +
      '/reports/' +
      reportName
    );
  }

  const getRecordClasses = memoize(async function getRecordClasses() {
    const decoder = Decode.arrayOf(expandedRecordClassDecoder);
    const recordClasses = await sendRequest(decoder, {
      method: 'get',
      path: '/record-types',
      params: { format: 'expanded' },
      useCache: true,
      cacheId: 'records',
    });
    // create indexes by name property for attributes and tables
    // this is done after recordClasses have been retrieved from the store
    // since it cannot reliably serialize Maps
    return recordClasses.map((recordClass) =>
      Object.assign(recordClass, {
        attributesMap: keyBy(recordClass.attributes, 'name'),
        tablesMap: keyBy(recordClass.tables, 'name'),
      })
    );
  });

  function getQuestions(): Promise<Array<Question>> {
    return getRecordClasses().then((result) => {
      return result.reduce(
        (arr, rc) => arr.concat(rc.searches),
        [] as Array<Question>
      );
    });
  }

  function findQuestion(urlSegment: string) {
    return getQuestions().then((qs) => {
      let question = qs.find((q) => q.urlSegment === urlSegment);
      if (question == null) {
        throw new ServiceError(
          `Could not find question "${urlSegment}".`,
          'Not found',
          404,
          uuid()
        );
      }
      return question;
    });
  }

  function findRecordClass(urlSegment: string) {
    return getRecordClasses().then((rs) => {
      let record = rs.find((r) => r.urlSegment === urlSegment);
      if (record == null) {
        throw new ServiceError(
          `Could not find record class "${urlSegment}".`,
          'Not found',
          404,
          uuid()
        );
      }
      return record;
    });
  }

  return {
    _version,
    _fetchJson,
    _getFromCache,
    _clearCache,
    serviceUrl,
    sendRequest,
    submitError,
    submitErrorIfNot500,
    submitErrorIfUndelayedAndNot500,
    getConfig,
    getUserProfileVocabulary,
    getVersion,
    getRecordClasses,
    findRecordClass,
    getQuestions,
    findQuestion,
    getRecordTypePath,
    getRecordTypesPath,
    getReportsEndpoint,
    getReportsPath,
    getSearchesPath,
    getSearchPath,
    getStandardSearchReportEndpoint,
    getCustomSearchReportEndpoint,
  };
};
