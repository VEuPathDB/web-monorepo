import localforage from 'localforage';
import * as QueryString from 'querystring';

import * as Decode from 'wdk-client/Utils/Json';
import { alert } from 'wdk-client/Utils/Platform';
import { pendingPromise } from 'wdk-client/Utils/PromiseUtils';
import { ServiceError } from 'wdk-client/Service/ServiceError';
import {   Question, RecordClass,} from 'wdk-client/Utils/WdkModel';
import { keyBy } from 'lodash';


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


export type ServiceBaseClass = typeof ServiceBase;

/**
 * A helper to request resources from a Wdk REST Service.
 */
export class ServiceBase {
  private _store: LocalForage = localforage.createInstance({
    name: 'WdkService/' + this.serviceUrl
  });
  private _cache: Map<string, Promise<any>> = new Map;
  private _initialCheck: Promise<void> | undefined;
  protected _version: number | undefined;
  private _isInvalidating = false;

  /**
   * @param {string} serviceUrl Base url for Wdk REST Service.
   */
  constructor(protected serviceUrl: string) { }

  /**
   * Get the configuration for the Wdk REST Service that resides at the given base url.
   */
  getConfig(): Promise<ServiceConfig> {
    return this.sendRequest(configDecoder, {
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
   sendRequest<Resource>(decoder: Decode.Decoder<Resource>, options: RequestOptions): Promise<Resource> {
    let { method, path, params, body, useCache, cacheId } = options;
    method = method.toUpperCase();
    let url = path + (params == null ? '' : '?' + QueryString.stringify(params));
    // Technically, only GET should be cache-able, but some resources treat POST
    // as GET, so we will allow it.
    if (useCache && (method === 'GET' || method === 'POST')) {
      let cacheKey = url + (cacheId == null ? '' : '__' + cacheId);
      return this._getFromCache(cacheKey,
        () => this.sendRequest(decoder, { ...options, useCache: false }));
    }
    return this._fetchJson(method, url, body).then(resp => {
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
      this.submitError(err);
      console.error(err);
      throw err;
    })
  }

  submitError(error: Error, extra?: any) {
    const { name, message, stack } = error;
    console.error(error);
    return this._checkStoreVersion().then(() =>
    this.sendRequest(Decode.none, {
      method: 'post',
      path: '/client-errors',
      body: JSON.stringify({ name, message, stack, extra })
    }));
  }

  protected _fetchJson<T>(method: string, url: string, body?: string, isBaseUrl?: boolean) {
    return fetch(
      isBaseUrl ? url : this.serviceUrl + url, 
      {
        method: method.toUpperCase(),
        body: body,
        credentials: 'include',
        headers: new Headers(Object.assign({
          'Content-Type': 'application/json'
        }, this._version && {
          [CLIENT_WDK_VERSION_HEADER]: this._version
        }))
      }).then(response => {
      if (this._isInvalidating) {
        return pendingPromise as Promise<T>;
      }

      if (response.ok) {
        return response.status === 204 ? undefined : response.json();
      }

      return response.text().then(text => {
        if (response.status === 409 && text === CLIENT_OUT_OF_SYNC_TEXT) {
          this._isInvalidating = true;
          Promise.all([
            this._store.clear(),
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
  protected _getFromCache<T>(key: string, onCacheMiss: () => Promise<T>) {
    if (!this._cache.has(key)) {
      let cacheValue$ = this._checkStoreVersion()
      .then(() => this._store.getItem<T>(key))
      .then(storeItem => {
        if (storeItem != null) return storeItem;
        return onCacheMiss().then(item => {
          return this._store.setItem(key, item)
          .catch(err => {
            console.error('Unable to store WdkService item with key `' + key + '`.', err);
            return item;
          });
        });
      });
      this._cache.set(key, cacheValue$);
    }
    return <Promise<T>>this._cache.get(key);
  }

  protected _checkStoreVersion() {
    if (this._initialCheck == null) {
      let serviceConfig$ = this._fetchJson<ServiceConfig>('get', '/');
      let storeConfig$ = this._store.getItem<ServiceConfig>('config');
      this._initialCheck = Promise.all([ serviceConfig$, storeConfig$ ])
      .then(([ serviceConfig, storeConfig ]) => {
        if (storeConfig == null || storeConfig.startupTime != serviceConfig.startupTime) {
          return this._store.clear().then(() => {
            return this._store.setItem('config', serviceConfig)
            .catch(err => {
              console.error('Unable to store WdkService item with key `config`.', err);
              return serviceConfig;
            })
          });
        }
        return serviceConfig;
      })
      .then(serviceConfig => {
        this._version = serviceConfig.startupTime;
        return undefined;
      })
    }
    return this._initialCheck;
  }

  getRecordTypesPath() {
    return '/record-types';
  }

  getRecordTypePath(recordClassUrlSegment: string) {
    return this.getRecordTypesPath() + '/' + recordClassUrlSegment;
  }

  getSearchesPath(recordClassUrlSegment: string) {
    return this.getRecordTypePath(recordClassUrlSegment) + '/searches';
  }

  getSearchPath(recordClassUrlSegment: string, questionUrlSegment: string) {
    return this.getSearchesPath(recordClassUrlSegment) + "/" + questionUrlSegment;
  }

  getReportsPath(recordClassUrlSegment: string, questionUrlSegment: string) {
    return this.getSearchesPath(recordClassUrlSegment) + '/' + questionUrlSegment;
  }

  getReportsEndpoint(recordClassUrlSegment: string, questionUrlSegment: string) {
    return this.getReportsPath(recordClassUrlSegment, questionUrlSegment);
  }

  getStandardSearchReportEndpoint(recordClassUrlSegment: string, questionUrlSegment: string) {
    return this.getReportsEndpoint(recordClassUrlSegment, questionUrlSegment) + "/reports/standard";
  }

  getCustomSearchReportEndpoint(recordClassUrlSegment: string, questionUrlSegment: string, reportName: string) {
    return this.getReportsEndpoint(recordClassUrlSegment, questionUrlSegment) + "/reports/" + reportName;
  }

  getRecordClasses() {
    let url = '/record-types?format=expanded';
    return this._getFromCache(url, () => this._fetchJson<RecordClass[]>('get', url)
      .then(recordClasses => {
        // create indexes by name property for attributes and tables
        // this is done after recordClasses have been retrieved from the store
        // since it cannot reliably serialize Maps
        return recordClasses.map(recordClass =>
          Object.assign(recordClass, {
            attributesMap: keyBy(recordClass.attributes, 'name'),
            tablesMap: keyBy(recordClass.tables, 'name')
          }));
    }));
  }

  getQuestions() : Promise<Array<Question>> {
    return this.getRecordClasses().then(result => {
      return result.reduce((arr, rc) => arr.concat(rc.searches), [] as Array<Question>);
    });
  }

  findQuestion(test: (question: Question) => boolean) {
    return this.getQuestions().then(qs => {
      let question = qs.find(test)
      if (question == null) {
        throw new ServiceError("Could not find question.", "Not found", 404);
      }
      return question;
    });
  }


  findRecordClass(test: (recordClass: RecordClass) => boolean) {
    return this.getRecordClasses().then(rs => {
      let record = rs.find(test);
      if (record == null) {
        throw new ServiceError("Could not find record class.", "Not found", 404);
      }
      return record;
    });
  }



}
