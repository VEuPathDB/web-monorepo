import { memoize } from 'lodash';
import localforage from 'localforage';
import * as QueryString from 'querystring';

import * as Decode from 'wdk-client/Utils/Json';
import { alert } from 'wdk-client/Utils/Platform';
import { pendingPromise } from 'wdk-client/Utils/PromiseUtils';
import { ServiceError } from 'wdk-client/Service/ServiceError';
import { Question, RecordClass,} from 'wdk-client/Utils/WdkModel';
import { keyBy } from 'lodash';
import { expandedRecordClassDecoder } from 'wdk-client/Service/Decoders/RecordClassDecoders';


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

export interface StandardWdkPostResponse  {id: number};

type RequestOptions = {
  /** Request method */
  method: string;
  /** Path to the resource, relative to the base url */
  path: string;
  /** Query params to include with request */
  params?: { [key: string]: any; };
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
}

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
}

const configDecoder: Decode.Decoder<ServiceConfig> =
  Decode.combine(
   Decode.field("authentication", Decode.combine(
     Decode.field('method', Decode.oneOf(Decode.constant('OAUTH2'), Decode.constant('USER_DB'))),
     Decode.field('oauthUrl', Decode.string),
     Decode.field('oauthClientUrl', Decode.string),
     Decode.field('oauthClientId', Decode.string)
   )),
   Decode.field('buildNumber', Decode.string),
   Decode.field('categoriesOntologyName', Decode.string),
   Decode.field('description', Decode.string),
   Decode.field('displayName', Decode.string),
   Decode.field('projectId', Decode.string),
   Decode.field('releaseDate', Decode.string),
   Decode.field('startupTime', Decode.number)
  );



export type ServiceBase = ReturnType<typeof ServiceBase>;

/**
 * A helper to request resources from a Wdk REST Service.
 * @param {string} serviceUrl Base url for Wdk REST Service.
 */
export const ServiceBase = (serviceUrl: string) => {
  const _store: LocalForage = localforage.createInstance({
    name: 'WdkService/' + serviceUrl
  });
  const _cache: Map<string, Promise<any>> = new Map;
  let _initialCheck: Promise<void> | undefined;
  let _version: number | undefined;
  let _isInvalidating = false;

  /**
   * Get the configuration for the Wdk REST Service that resides at the given base url.
   */
  function getConfig(): Promise<ServiceConfig> {
    return sendRequest(configDecoder, {
      method: 'get',
      path: '/',
      useCache: true,
      cacheId: 'config'
    });
  }

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
   * @return {Promise<Resource>}
   */
   function sendRequest<Resource>(decoder: Decode.Decoder<Resource>, options: RequestOptions): Promise<Resource> {
    let { method, path, params, body, useCache, cacheId } = options;
    method = method.toUpperCase();
    let url = path + (params == null ? '' : '?' + QueryString.stringify(params));
    // Technically, only GET should be cache-able, but some resources treat POST
    // as GET, so we will allow it.
    if (useCache && (method === 'GET' || method === 'POST')) {
      let cacheKey = url + (cacheId == null ? '' : '__' + cacheId);
      return _getFromCache(cacheKey,
        () => sendRequest(decoder, { ...options, useCache: false }));
    }
    return _fetchJson(method, url, body).then(resp => {
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

      errorMessage += '\n\n' + `    Expected ${result.expected}, but got ${JSON.stringify(result.value)}.`;

      const err = Error(errorMessage);
      submitError(err);
      console.error(err);
      throw err;
    })
  }

  function submitError(error: Error, extra?: any) {
    const { name, message, stack } = error;
    console.group('Client error log');
    console.error(error);
    console.groupEnd();
    return _checkStoreVersion().then(() =>
    sendRequest(Decode.none, {
      method: 'post',
      path: '/client-errors',
      body: JSON.stringify({ name, message, stack, extra })
    }));
  }

  async function submitErrorIfNot500(error: Error): Promise<void> {
    if ('status' in error && (error as ServiceError).status >= 500) return;
    return submitError(error);
  }

  function _fetchJson<T>(method: string, url: string, body?: string, isBaseUrl?: boolean) {
    return fetch(
      isBaseUrl ? url : serviceUrl + url, 
      {
        method: method.toUpperCase(),
        body: body,
        credentials: 'include',
        headers: new Headers(Object.assign({
          'Content-Type': 'application/json'
        }, _version && {
          [CLIENT_WDK_VERSION_HEADER]: _version
        }))
      }).then(response => {
      if (_isInvalidating) {
        return pendingPromise as Promise<T>;
      }

      if (response.ok) {
        return response.status === 204 ? undefined : response.json();
      }

      return response.text().then(text => {
        if (response.status === 409 && text === CLIENT_OUT_OF_SYNC_TEXT) {
          _isInvalidating = true;
          Promise.all([
            _store.clear(),
            alert('Reload Page', 'This page is no longer valid and will be reloaded when you click "OK"')
          ])
          .then(() => location.reload(true));
          return pendingPromise as Promise<T>;
        }

        throw new ServiceError(
          `Cannot ${method.toUpperCase()} ${url} (${response.status})`,
          text,
          response.status
        );
      });
    }) as Promise<T>
  }

  /**
   * Checks cache for item associated to key. If item is not in cache, then
   * call onCacheMiss callback and set the resolved value in the cache.
   */
  function _getFromCache<T>(key: string, onCacheMiss: () => Promise<T>) {
    if (!_cache.has(key)) {
      let cacheValue$ = _checkStoreVersion()
      .then(() => _store.getItem<T>(key))
      .then(storeItem => {
        if (storeItem != null) return storeItem;
        return onCacheMiss().then(item => {
          return _store.setItem(key, item)
          .catch(err => {
            console.error('Unable to store WdkService item with key `' + key + '`.', err);
            return item;
          });
        });
      });
      _cache.set(key, cacheValue$);
    }
    return <Promise<T>>_cache.get(key);
  }

  function _checkStoreVersion() {
    if (_initialCheck == null) {
      let serviceConfig$ = _fetchJson<ServiceConfig>('get', '/');
      let storeConfig$ = _store.getItem<ServiceConfig>('config');
      _initialCheck = Promise.all([ serviceConfig$, storeConfig$ ])
      .then(([ serviceConfig, storeConfig ]) => {
        if (storeConfig == null || storeConfig.startupTime != serviceConfig.startupTime) {
          return _store.clear().then(() => {
            return _store.setItem('config', serviceConfig)
            .catch(err => {
              console.error('Unable to store WdkService item with key `config`.', err);
              return serviceConfig;
            })
          });
        }
        return serviceConfig;
      })
      .then(serviceConfig => {
        _version = serviceConfig.startupTime;
        return undefined;
      })
    }
    return _initialCheck;
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

  function getSearchPath(recordClassUrlSegment: string, questionUrlSegment: string) {
    return getSearchesPath(recordClassUrlSegment) + "/" + questionUrlSegment;
  }

  function getReportsPath(recordClassUrlSegment: string, questionUrlSegment: string) {
    return getSearchesPath(recordClassUrlSegment) + '/' + questionUrlSegment;
  }

  function getReportsEndpoint(recordClassUrlSegment: string, questionUrlSegment: string) {
    return getReportsPath(recordClassUrlSegment, questionUrlSegment);
  }

  function getStandardSearchReportEndpoint(recordClassUrlSegment: string, questionUrlSegment: string) {
    return getReportsEndpoint(recordClassUrlSegment, questionUrlSegment) + "/reports/standard";
  }

  function getCustomSearchReportEndpoint(recordClassUrlSegment: string, questionUrlSegment: string, reportName: string) {
    return getReportsEndpoint(recordClassUrlSegment, questionUrlSegment) + "/reports/" + reportName;
  }

  const getRecordClasses = memoize(async function getRecordClasses() {
    const decoder = Decode.arrayOf(expandedRecordClassDecoder);
    const recordClasses = await sendRequest(decoder, {
      method: 'get',
      path: '/record-types',
      params: { format: 'expanded' },
      useCache: true,
      cacheId: 'records'
    });
    // create indexes by name property for attributes and tables
    // this is done after recordClasses have been retrieved from the store
    // since it cannot reliably serialize Maps
    return recordClasses.map(recordClass =>
      Object.assign(recordClass, {
        attributesMap: keyBy(recordClass.attributes, 'name'),
        tablesMap: keyBy(recordClass.tables, 'name')
      }));
  });

  function getQuestions() : Promise<Array<Question>> {
    return getRecordClasses().then(result => {
      return result.reduce((arr, rc) => arr.concat(rc.searches), [] as Array<Question>);
    });
  }

  function findQuestion(test: (question: Question) => boolean) {
    return getQuestions().then(qs => {
      let question = qs.find(test)
      if (question == null) {
        throw new ServiceError("Could not find question.", "Not found", 404);
      }
      return question;
    });
  }


  function findRecordClass(test: (recordClass: RecordClass) => boolean) {
    return getRecordClasses().then(rs => {
      let record = rs.find(test);
      if (record == null) {
        throw new ServiceError("Could not find record class.", "Not found", 404);
      }
      return record;
    });
  }


  return {
    _version,
    _fetchJson,
    _getFromCache,
    serviceUrl,
    sendRequest,
    submitError,
    submitErrorIfNot500,
    getConfig,
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

}
