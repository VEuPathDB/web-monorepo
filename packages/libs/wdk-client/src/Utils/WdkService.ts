import stringify from 'json-stable-stringify';
import localforage from 'localforage';
import { difference, keyBy, memoize } from 'lodash';
import * as QueryString from 'querystring';

import { submitAsForm } from 'wdk-client/Utils/FormSubmitter';
import * as Decode from 'wdk-client/Utils/Json';
import { Ontology } from 'wdk-client/Utils/OntologyUtils';
import { alert } from 'wdk-client/Utils/Platform';
import { pendingPromise, synchronized } from 'wdk-client/Utils/PromiseUtils';
import { StepAnalysisConfig, stepAnalysisDecoder, stepAnalysisConfigDecoder, stepAnalysisTypeDecoder, stepAnalysisStatusDecoder, FormParams } from 'wdk-client/Utils/StepAnalysisUtils';
import { PreferenceScope, Step, User, UserPreferences, UserWithPrefs, strategyDecoder } from 'wdk-client/Utils/WdkUser';

import { CategoryTreeNode, pruneUnknownPaths, resolveWdkReferences, sortOntology } from 'wdk-client/Utils/CategoryUtils';
import {
  Answer,
  AnswerFormatting,
  AnswerSpec,
  AttributeField,
  Favorite,
  StepSpec,
  Parameter,
  ParameterGroup,
  ParameterValue,
  ParameterValues,
  PrimaryKey,
  Question,
  QuestionWithParameters,
  RecordClass,
  RecordInstance,
  Reporter,
  TreeBoxVocabNode,
  UserDataset,
  UserDatasetMeta,
  AnswerJsonFormatConfig,
  SummaryViewPluginField,
} from 'wdk-client/Utils/WdkModel';
import { OntologyTermSummary } from 'wdk-client/Components/AttributeFilter/Types';

/**
 * Header added to service requests to indicate the version of the model
 * current stored in cache.
 */
const CLIENT_WDK_VERSION_HEADER = 'x-client-wdk-timestamp';

/**
 * Response text returned by service that indicates the version of the cached
 * model is stale, based on CLIENT_WDK_VERSION_HEADER.
 */
const CLIENT_OUT_OF_SYNC_TEXT = 'WDK-TIMESTAMP-MISMATCH';

interface RecordRequest {
  attributes: string[];
  tables: string[];
  primaryKey: PrimaryKey;
}

export interface AnswerRequest {
  answerSpec: AnswerSpec;
  formatting?: {
    format?: string;
    formatConfig?: any;
  }
}

export interface AnswerJsonRequest {
  answerSpec: AnswerSpec;
  formatConfig: AnswerJsonFormatConfig;
}

interface TempResultResponse {
  id: string;
}

export type BasketOperation = 'add' | 'remove' ;

export type DatasetConfig = {
  sourceType: 'idList',
  sourceContent: { ids: string[] }
} | {
  sourceType: 'basket',
  sourceContent: { basketName: string }
} | {
  sourceType: 'file',
  sourceContent: {
    temporaryFileId: string,
    parser: string,
    questionName: string,
    parameterName: string
  }
} | {
  sourceType: 'strategy',
  sourceContent: { strategyId: number }
}

export type UserDatasetShareResponse = {
  [Key in 'add' | 'delete']: {
    [Key in string]: UserDataset['sharedWith']
  }
}

export class ServiceError extends Error {
  constructor(
    message: string,
    public response: string,
    public status: number
  ) {
    super(message);
  }
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

/** This is for POST requests */
export type TryLoginResponse = {
  success: true;
  redirectUrl: string;
} | {
  success: false;
  message: string;
}

type BasketStatusResponse = Array<boolean>;

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

// JSON Decoders
// -------------

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

/** This is for POST requests */
const tryLoginDecoder: Decode.Decoder<TryLoginResponse> =
  Decode.oneOf(
    Decode.combine(
      Decode.field('success', Decode.constant(true)),
      Decode.field('redirectUrl', Decode.string)
    ),
    Decode.combine(
      Decode.field('success', Decode.constant(false)),
      Decode.field('message', Decode.string)
    )
  )

const treeBoxVocabDecoder: Decode.Decoder<TreeBoxVocabNode> =
  Decode.combine(
    Decode.field('data', Decode.combine(
      Decode.field('term', Decode.string),
      Decode.field('display', Decode.string)
    )),
    Decode.field('children', Decode.lazy(() => Decode.arrayOf(treeBoxVocabDecoder)))
  )

const parameterDecoder: Decode.Decoder<Parameter> =
  Decode.combine(
    /* Common properties */
    Decode.combine(
      Decode.field('name', Decode.string),
      Decode.field('displayName', Decode.string),
      Decode.field('properties', Decode.optional(Decode.objectOf(Decode.arrayOf(Decode.string)))),
      Decode.field('help', Decode.string),
      Decode.field('isVisible', Decode.boolean),
      Decode.field('group', Decode.string),
      Decode.field('isReadOnly', Decode.boolean),
      Decode.field('defaultValue', Decode.optional(Decode.string)),
      Decode.field('dependentParams', Decode.arrayOf(Decode.string))
    ),
    Decode.oneOf(
      /* AnswerParam */
      Decode.field('type', Decode.constant('AnswerParam')),
      /* DatasetParam */
      Decode.combine(
        Decode.field('type', Decode.constant('DatasetParam')),
        Decode.field('defaultIdList', Decode.optional(Decode.string)),
        Decode.field('parsers', Decode.arrayOf(
          Decode.combine(
            Decode.field('name', Decode.string),
            Decode.field('displayName', Decode.string),
            Decode.field('description', Decode.string),
          )
        ))
      ),
      /* TimestampParam */
      Decode.field('type', Decode.constant('TimestampParam')),
      /* StringParam  */
      Decode.combine(
        Decode.field('type', Decode.constant('StringParam')),
        Decode.field('length', Decode.number)
      ),
      /* FilterParamNew */
      Decode.combine(
        Decode.field('type', Decode.constant('FilterParamNew')),
        Decode.field('filterDataTypeDisplayName', Decode.optional(Decode.string)),
        Decode.field('minSelectedCount', Decode.number),
        Decode.field('hideEmptyOntologyNodes', Decode.optional(Decode.boolean)),
        Decode.field('values', Decode.objectOf(Decode.arrayOf(Decode.string))),
        Decode.field('ontology', Decode.arrayOf(
          Decode.combine(
            Decode.field('term', Decode.string),
            Decode.field('parent', Decode.optional(Decode.string)),
            Decode.field('display', Decode.string),
            Decode.field('description', Decode.optional(Decode.string)),
            Decode.field('type', Decode.optional(Decode.oneOf(
              Decode.constant('date'), Decode.constant('string'), Decode.constant('number'), Decode.constant('multiFilter')
            ))),
            // Decode.field('units', Decode.string),
            Decode.field('precision', Decode.number),
            Decode.field('isRange', Decode.boolean),
          )
        ))
      ),
      /* EnumParam */
      Decode.combine(
        Decode.field('type', Decode.oneOf(Decode.constant('EnumParam'), Decode.constant('FlatVocabParam'))),
        // Decode.field('displayType', Decode.string),
        Decode.field('countOnlyLeaves', Decode.boolean),
        Decode.field('maxSelectedCount', Decode.number),
        Decode.field('minSelectedCount', Decode.number),
        Decode.field('multiPick', Decode.boolean),
        Decode.field('depthExpanded', Decode.number),
        Decode.oneOf(
          /* Checkbox */
          Decode.combine(
            Decode.field('displayType', Decode.constant('checkBox')),
            Decode.field('vocabulary', Decode.arrayOf(Decode.tuple(Decode.string, Decode.string, Decode.nullValue)))
          ),
          /* Select */
          Decode.combine(
            Decode.field('displayType', Decode.constant('select')),
            Decode.field('vocabulary', Decode.arrayOf(Decode.tuple(Decode.string, Decode.string, Decode.nullValue)))
          ),
          /* TypeAhead */
          Decode.combine(
            Decode.field('displayType', Decode.constant('typeAhead')),
            Decode.field('vocabulary', Decode.arrayOf(Decode.tuple(Decode.string, Decode.string, Decode.nullValue)))
          ),
          /* Treebox */
          Decode.combine(
            Decode.field('displayType', Decode.constant('treeBox')),
            Decode.field('vocabulary', treeBoxVocabDecoder)
          ),
        )
      ),
      /* NumberParam */
      Decode.combine(
        Decode.field('type', Decode.constant('NumberParam')),
        Decode.field('min', Decode.number),
        Decode.field('max', Decode.number),
        Decode.field('step', Decode.number),
      ),
      /* NumberRangeParam */
      Decode.combine(
        Decode.field('type', Decode.constant('NumberRangeParam')),
        Decode.field('min', Decode.number),
        Decode.field('max', Decode.number),
        Decode.field('step', Decode.number),
      ),
      /* DateParam */
      Decode.combine(
        Decode.field('type', Decode.constant('DateParam')),
        Decode.field('minDate', Decode.string),
        Decode.field('maxDate', Decode.string),
      ),

      /* DateRangeParam */
      Decode.combine(
        Decode.field('type', Decode.constant('DateRangeParam')),
        Decode.field('minDate', Decode.string),
        Decode.field('maxDate', Decode.string),
      ),
    )
  )

const parametersDecoder: Decode.Decoder<Parameter[]> =
  Decode.arrayOf(parameterDecoder)

const paramGroupDecoder: Decode.Decoder<ParameterGroup> =
  Decode.combine(
    Decode.field('description', Decode.string),
    Decode.field('displayName', Decode.string),
    Decode.field('displayType', Decode.string),
    Decode.field('isVisible', Decode.boolean),
    Decode.field('name', Decode.string),
    Decode.field('parameters', Decode.arrayOf(Decode.string))
  )

const reporterDecoder: Decode.Decoder<Reporter> =
  Decode.combine(
    Decode.field('name', Decode.string),
    Decode.field('type', Decode.string),
    Decode.field('displayName', Decode.string),
    Decode.field('description', Decode.string),
    Decode.field('isInReport', Decode.boolean),
    // TODO Replace with list of known scopes
    Decode.field('scopes', Decode.arrayOf(Decode.string)),
  )

const attributeFieldDecoder: Decode.Decoder<AttributeField> =
  Decode.combine(
    Decode.field('name', Decode.string),
    Decode.field('displayName', Decode.string),
    Decode.field('formats', Decode.arrayOf(reporterDecoder)),
    Decode.field('properties', Decode.optional(Decode.objectOf(Decode.arrayOf(Decode.string)))),
    Decode.field('help', Decode.optional(Decode.string)),
    Decode.field('align', Decode.optional(Decode.string)),
    Decode.field('type', Decode.optional(Decode.string)),
    Decode.field('truncateTo', Decode.number),
    Decode.combine(
      Decode.field('isSortable', Decode.boolean),
      Decode.field('isRemovable', Decode.boolean),
      Decode.field('isDisplayable', Decode.boolean),
    )
  )

const summaryViewPluginFieldDecoder: Decode.Decoder<SummaryViewPluginField> =
  Decode.combine(
    Decode.field('name', Decode.string),
    Decode.field('displayName', Decode.string),
    Decode.field('description', Decode.string)
  );

const questionSharedDecoder =
  Decode.combine(
    Decode.combine(
      Decode.field('name', Decode.string),
      Decode.field('displayName', Decode.string),
      Decode.field('properties', Decode.optional(Decode.objectOf(Decode.arrayOf(Decode.string)))),
      Decode.field('summary', Decode.optional(Decode.string)),
      Decode.field('description', Decode.optional(Decode.string)),
      Decode.field('shortDisplayName', Decode.string),
      Decode.field('recordClassName', Decode.string),
      Decode.field('help', Decode.optional(Decode.string)),
      Decode.field('newBuild', Decode.optional(Decode.string)),
      Decode.field('reviseBuild', Decode.optional(Decode.string)),
    ),
    Decode.field('urlSegment', Decode.string),
    Decode.field('groups', Decode.arrayOf(paramGroupDecoder)),
    Decode.field('defaultAttributes', Decode.arrayOf(Decode.string)),
    Decode.field('defaultSorting', Decode.arrayOf(
      Decode.combine(
        Decode.field('attributeName', Decode.string),
        Decode.field('direction', Decode.oneOf(Decode.constant('ASC'), Decode.constant('DESC')))
      )
    )),
    Decode.field('dynamicAttributes', Decode.arrayOf(attributeFieldDecoder)),
    Decode.field('defaultSummaryView', Decode.string),
    Decode.field('summaryViewPlugins', Decode.arrayOf(summaryViewPluginFieldDecoder)),
    Decode.field('stepAnalysisPlugins', Decode.arrayOf(Decode.string)),
  )

const questionDecoder: Decode.Decoder<Question> =
  Decode.combine(
    questionSharedDecoder,
    Decode.field('parameters', Decode.arrayOf(Decode.string))
  )

const questionsDecoder: Decode.Decoder<Question[]> =
  Decode.arrayOf(questionDecoder)

const questionWithParametersDecoder: Decode.Decoder<QuestionWithParameters> =
  Decode.combine(
    questionSharedDecoder,
    Decode.field('parameters', parametersDecoder)
  )


/**
 * A helper to request resources from a Wdk REST Service.
 *
 * @class WdkService
 */
export default class WdkService {
  private static _instances: Map<string, WdkService> = new Map;

  static getInstance(serviceUrl: string): WdkService {
    if (!this._instances.has(serviceUrl)) {
      this._instances.set(serviceUrl, new this(serviceUrl));
    }
    return this._instances.get(serviceUrl) as WdkService;
  }

  private _store: LocalForage = localforage.createInstance({
    name: 'WdkService/' + this.serviceUrl
  });
  private _cache: Map<string, Promise<any>> = new Map;
  private _recordCache: Map<string, {request: RecordRequest; response: Promise<RecordInstance>}> = new Map;
  private _stepMap = new Map<number, Promise<Step>>();
  private _preferences: Promise<UserPreferences> | undefined;
  private _currentUserPromise: Promise<User> | undefined;
  private _initialCheck: Promise<void> | undefined;
  private _version: number | undefined;
  private _isInvalidating = false;

  /**
   * @param {string} serviceUrl Base url for Wdk REST Service.
   */
  private constructor(private serviceUrl: string) {
    this.getOntology = memoize(this.getOntology.bind(this));
    this.patchUserPreference = synchronized(this.patchUserPreference);
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
  private sendRequest<Resource>(decoder: Decode.Decoder<Resource>, options: RequestOptions): Promise<Resource> {
    let { method, path, params, body, useCache, cacheId } = options;
    method = method.toUpperCase();
    let url = path + (params == null ? '' : '?' + queryParams(params));
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

  /**
   * Get the configuration for the Wdk REST Service that resides at the given base url.
   * @return {Promise<ServiceConfig>}
   */
  getConfig() {
    return this.sendRequest(configDecoder, {
      method: 'get',
      path: '/',
      useCache: true,
      cacheId: 'config'
    });
  }

  getAnswerServicePath() {
    return '/answer/report';
  }

  getAnswerServiceEndpoint() {
    return this.serviceUrl + this.getAnswerServicePath();
  }

  getAnswerJsonServicePath() {
    return '/answer';
  }

  getAnswerJsonServiceEndpoint() {
    return this.serviceUrl + this.getAnswerJsonServicePath();
  }

  tryLogin(email: string, password: string, redirectUrl: string) {
    return this.sendRequest(tryLoginDecoder, {
      method: 'post',
      path: '/login',
      body: JSON.stringify({ email, password, redirectUrl })
    });
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

  /**
   * Get all Questions defined in WDK Model.
   *
   * @return {Promise<Array<Object>>}
   */
  getQuestions() {
    return this.sendRequest(questionsDecoder, {
      method: 'get',
      path: '/questions',
      params: {
        expandQuestions: 'true'
      },
      useCache: true
    })
  }

  /**
   * Get the first Question that matches `test`.
   *
   * @param {Function} test Predicate function the Question must satisfy
   * @return {Promise<Object?>}
   */
  findQuestion(test: (question: Question) => boolean) {
    return this.getQuestions().then(qs => {
      let question = qs.find(test)
      if (question == null) {
        throw new ServiceError("Could not find question.", "Not found", 404);
      }
      return question;
    });
  }

  /**
   * Fetch question with default param values/vocabularies (may get from cache if already present)
   */
  getQuestionAndParameters(identifier: string) {
    return this.sendRequest(questionWithParametersDecoder, {
      method: 'get',
      path: `/questions/${identifier}`,
      params: {
        expandParams: 'true',
      },
      useCache: true
    });
  }

  /**
   * Fetch question information (e.g. vocabularies) given the passed param values; never cached
   */
  getQuestionGivenParameters(identifier: string, paramValues: ParameterValues) {
    return this.sendRequest(questionWithParametersDecoder, {
      method: 'post',
      path: `/questions/${identifier}`,
      body: JSON.stringify({ contextParamValues: paramValues })
    });
  }

  getQuestionParamValues(identifier: string, paramName: string, paramValue: ParameterValue, paramValues: ParameterValues) {
    return this.sendRequest(parametersDecoder, {
      method: 'post',
      path: `/questions/${identifier}/refreshed-dependent-params`,
      body: JSON.stringify({
        changedParam: { name: paramName, value: paramValue },
        contextParamValues: paramValues
      })
    })
  }

  getOntologyTermSummary(identifier: string, paramName: string, filters: any, ontologyId: string, paramValues: ParameterValues) {
    return this._fetchJson<OntologyTermSummary>(
      'post',
      `/questions/${identifier}/${paramName}/ontology-term-summary`,
      JSON.stringify({
        ontologyId,
        filters,
        contextParamValues: paramValues
      })
    );
  }

  getFilterParamSummaryCounts(identifier: string, paramName: string, filters: any, paramValues: ParameterValues) {
    return this._fetchJson<{filtered: number, unfiltered: number, nativeFiltered: number, nativeUnfiltered: number}>(
      'post',
      `/questions/${identifier}/${paramName}/summary-counts`,
      JSON.stringify({
        filters,
        contextParamValues: paramValues
      })
    );
  }

  /**
   * Get all RecordClasses defined in WDK Model.
   */
  getRecordClasses() {
    let url = '/records?format=expanded';
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

  /**
   * Get the first RecordClass that matches `test`.
   *
   * @param {Function} test Predicate the RecordClass must satisfy.
   * @return {Promise<Object?>}
   */
  findRecordClass(test: (recordClass: RecordClass) => boolean) {
    return this.getRecordClasses().then(rs => {
      let record = rs.find(test);
      if (record == null) {
        throw new ServiceError("Could not find record.", "Not found", 404);
      }
      return record;
    });
  }

  /**
   * Get a record instance identified by the provided record class and primary
   * key, with the configured tables and attributes.
   *
   * The record instance will be stored in memory. Any subsequent requests will
   * be merged with the in-memory request.
   *
   * XXX Use _getFromCache with key of "recordInstance" so the most recent record is saved??
   */
  getRecord(recordClassName: string, primaryKey: PrimaryKey, options: {attributes?: string[]; tables?: string[];} = {}) {
    let cacheKey = recordClassName + ':' + stringify(primaryKey);
    let method = 'post';
    let url = '/records/' + recordClassName + '/instance';

    let { attributes = [], tables = [] } = options;
    let cacheEntry = this._recordCache.get(cacheKey);

    // if we don't have the record, fetch whatever is requested
    if (cacheEntry == null) {
      let request = { attributes, tables, primaryKey };
      let response = this._fetchJson<RecordInstance>(method, url, stringify(request));
      cacheEntry = { request, response };
      this._recordCache.set(cacheKey, cacheEntry);
    }

    // Get the request and response from `_recordCache` and replace them with
    // merged request and response objects. Anything awaiting the response that
    // is currently stored will still be called when it completes, regardless of
    // the progress of the response it is replaced with.
    else {
      let { request, response } = cacheEntry;
      // determine which tables and attributes we need to retrieve
      let reqAttributes = difference(attributes, request.attributes);
      let reqTables = difference(tables, request.tables);

      // get addition attributes and tables
      if (reqAttributes.length > 0 || reqTables.length > 0) {
        let newRequest = {
          primaryKey,
          attributes: reqAttributes,
          tables: reqTables
        };
        let newResponse = this._fetchJson<RecordInstance>(method, url, stringify(newRequest));

        let finalRequest = {
          primaryKey,
          attributes: request.attributes.concat(newRequest.attributes),
          tables: request.tables.concat(newRequest.tables)
        };
        // merge old record attributes and tables with new record
        let finalResponse = Promise.all([ response, newResponse ])
        .then(([record, newRecord]) => {
          return Object.assign({}, record, {
            attributes: Object.assign({}, record.attributes, newRecord.attributes),
            tables: Object.assign({}, record.tables, newRecord.tables),
            tableErrors: difference(record.tableErrors, reqTables).concat(newRecord.tableErrors)
          });
        });
        cacheEntry = { request: finalRequest, response: finalResponse };
        this._recordCache.set(cacheKey, cacheEntry);
      }
    }

    return cacheEntry.response;
  }

  /**
   * Get an answer from the answer service.
   */
  getAnswer(answerSpec: AnswerSpec, formatting: AnswerFormatting): Promise<Answer> {
    let method = 'post';
    let url = this.getAnswerServicePath();
    let body: AnswerRequest = { answerSpec, formatting };
    return this._fetchJson<Answer>(method, url, stringify(body));
  }

  /**
   * Get the default answer json from the answer service.
   */
  getAnswerJson(answerSpec: AnswerSpec, formatConfig: AnswerJsonFormatConfig): Promise<Answer> {
    let method = 'post';
    let url = this.getAnswerJsonServicePath();
    let body: AnswerJsonRequest = { answerSpec, formatConfig };
    return this._fetchJson<Answer>(method, url, stringify(body));
  }

  getXmlAnswerJson(xmlQuestionName: string) {
    return this.sendRequest(Decode.ok, {
      method: 'GET',
      path: `/xml-answer/${xmlQuestionName}`,
      useCache: true
    });
  }

  /**
   * Get a temporary result
   */
  getTemporaryResultUrl(answerSpec: AnswerSpec, formatting: AnswerFormatting): Promise<string> {
    let method = 'post';
    let url = '/temporary-results';
    let body: AnswerRequest = { answerSpec, formatting };
    return this._fetchJson<TempResultResponse>(method, url, stringify(body))
      .then(result => window.location.origin + this.serviceUrl + url + '/' + result.id);
  }

  /**
   * Get basket summary for all record classes
   */
  getBasketCounts() {
    return this._fetchJson<{ [recordClassName: string]: number }>('get', '/users/current/baskets');
  }

  getBasketStatus(recordClassName: string, records: Array<RecordInstance>): Promise<BasketStatusResponse> {
    let data = JSON.stringify(records.map(record => record.id));
    let url = `/users/current/baskets/${recordClassName}/query`;
    return this._fetchJson<BasketStatusResponse>('post', url, data);
  }

  getBasketStatusPk(recordClassName: string, records: Array<PrimaryKey>): Promise<BasketStatusResponse> {
    let data = JSON.stringify(records);
    let url = `/users/current/baskets/${recordClassName}/query`;
    return this._fetchJson<BasketStatusResponse>('post', url, data);
  }

  updateBasketStatus(operation: BasketOperation, recordClassName: string, primaryKeys: Array<PrimaryKey>): Promise<never> {
    let data = JSON.stringify({ [operation]: primaryKeys });
    let url = `/users/current/baskets/${recordClassName}`;
    return this._fetchJson<never>('patch', url, data);
  }

  /**
   * Gets favorite ID of a single record, or undefined if record is not a
   * favorite of the current user.  Thus can be used to check whether a record
   * is a favorite of the current user.
   *
   * @param record Record instance to search for
   */
  getFavoriteId (record: RecordInstance) {
      let data = [{
        recordClassName: record.recordClassName,
        primaryKey: record.id
      }];
      let url = '/users/current/favorites/query';
      return this
        ._fetchJson<Array<number>>('post', url, JSON.stringify(data))
        .then(data => data.length ? data[0] : undefined);
    }

  /**
   * Adds the passed record as a favorite of the current user and returns ID
   * of the new favorite.
   *
   * @param record Record to add as a favorite
   */
  addFavorite (record: RecordInstance) {
    const { recordClassName, id } = record;
    const favorite = { recordClassName, primaryKey: id };
    const url = '/users/current/favorites';
    return this
      ._fetchJson<Favorite>('post', url, JSON.stringify(favorite))
      .then(data => data.id);
  }

  /**
   * Deletes the favorite with the passed ID and returns a promise with the
   * "new ID" i.e. undefined since favorite no longer exists
   *
   * @param id id of favorite to delete
   */
  deleteFavorite (id: number) {
    let url = '/users/current/favorites/' + id;
    return this
      ._fetchJson<void>('delete', url)
      .then(() => undefined);
  }

  /**
   * Returns an array of the current user's favorites
   */
  getCurrentFavorites () {
    return this._fetchJson<Favorite[]>('get', '/users/current/favorites');
  }

  /**
   * Saves the note and group on the passed favorite to the server
   *
   * @param favorite
   */
  saveFavorite (favorite: Favorite) {
    let url = '/users/current/favorites/' + favorite.id;
    favorite.group = favorite.group ? favorite.group : '';
    favorite.description = favorite.description ? favorite.description : '';
    return this._fetchJson<void>('put', url, JSON.stringify(favorite));
  }

  deleteFavorites (ids: Array<number>) {
    return this.runBulkFavoritesAction('delete', ids);
  }

  undeleteFavorites (ids: Array<number>) {
    return this.runBulkFavoritesAction('undelete', ids);
  }

  private runBulkFavoritesAction (operation: string, ids: Array<number>) {
    let url = '/users/current/favorites';
    let base = { delete: [], undelete: [] };
    let data = Object.assign({}, base, { [operation]: ids });
    return this._fetchJson<void>('patch', url, JSON.stringify(data));
  }

  getCurrentUser() {
    if (this._currentUserPromise == null) {
      this._currentUserPromise = this._fetchJson<User>('get', '/users/current');
    }
    return this._currentUserPromise;
  }

  createNewUser(userWithPrefs: UserWithPrefs) {
    return this._fetchJson<User>('post', '/users', JSON.stringify(userWithPrefs));
  }

  updateCurrentUser(user: User) {
    let url = '/users/current';
    let data = JSON.stringify(user);
    return this._currentUserPromise = this._fetchJson<void>('put', url, data).then(() => user);
  }

  updateCurrentUserPassword(oldPassword: string, newPassword: string) {
    let url = '/users/current/password';
    let data = JSON.stringify({ oldPassword: oldPassword, newPassword: newPassword });
    return this._fetchJson<void>('put', url, data);
  }

  resetUserPassword(email: string) {
    let url = '/user-password-reset';
    let data = JSON.stringify({ email });
    return this._fetchJson<void>('post', url, data);
  }

  getCurrentUserPreferences() : Promise<UserPreferences> {
    if (!this._preferences) {
      this._preferences = this._fetchJson<UserPreferences>('get', '/users/current/preferences');
    }
    return this._preferences;
  }

  // update or add a single user preference
  patchUserPreference(scope: PreferenceScope, key: string, value: string) : Promise<UserPreferences> {
    let entries = { [scope]: { [key]: value }};
    let url = '/users/current/preferences';
    let data = JSON.stringify(entries);
    return this._fetchJson<void>('patch', url, data)
      .then(() => this.getCurrentUserPreferences())
      .then(preferences => {
        // merge with cached preferences only if patch succeeds
        return this._preferences = Promise.resolve({ ...preferences, ...entries });
      });
  }

  // replace all user preferences
  putUserPreferences(entries: UserPreferences) : Promise<UserPreferences> {
    let url = '/users/current/preferences';
    let data = JSON.stringify(entries);
    return this._fetchJson<void>('put', url, data).then(() => {
      // merge with cached preferences only if patch succeeds
      return this._preferences = Promise.resolve(entries);
    });
  }

  getCurrentUserDatasets() {
    return this._fetchJson<UserDataset[]>('get', '/users/current/user-datasets?expandDetails=true');
  }

  getUserDataset(id: number) {
    return this._fetchJson<UserDataset>('get', `/users/current/user-datasets/${id}`)
  }

  updateUserDataset(id: number, meta: UserDatasetMeta) {
    return this._fetchJson<void>('put', `/users/current/user-datasets/${id}/meta`, JSON.stringify(meta));
  }

  removeUserDataset(id: number) {
    return this._fetchJson<void>('delete', `/users/current/user-datasets/${id}`);
  }

  checkIfUserEmailExists (emailAddress: string) {
    return this._fetchJson<void>('post', '/user-id-query', JSON.stringify({ emails: [ emailAddress ]}));
  }

  editUserDatasetSharing (actionName: string, userDatasetIds: number[], recipientUserIds: number[]) {
    const acceptableActions = [ 'add', 'delete' ];
    if (!actionName || !acceptableActions.includes(actionName))
      throw new TypeError(`editUserDatasetSharing: invalid action name given: "${actionName}"`);
    const delta = JSON.stringify({
      [actionName]: userDatasetIds
        .map(id => `${id}`)
        .reduce((output: object, datasetId: string) => {
          Object.defineProperty(output, datasetId, {
            value: recipientUserIds.map(id => `${id}`),
            enumerable: true
          });
          return output;
        }, {})
    });
    return this._fetchJson<UserDatasetShareResponse>('patch', '/users/current/user-datasets/sharing', delta);
  }

  getOauthStateToken() {
    return this._fetchJson<{oauthStateToken: string}>('get', '/oauth/state-token');
  }

  findStep(stepId: number, userId: string = "current"): Promise<Step> {
    // cache step resonse
    if (!this._stepMap.has(stepId)) {
      this._stepMap.set(stepId, this._fetchJson<Step>('get', `/users/${userId}/steps/${stepId}`).catch(error => {
        // if the request fails, remove the response since a later request might succeed
        this._stepMap.delete(stepId);
        throw error;
      }))
    }
    return this._stepMap.get(stepId)!;
  }

  createStep(newStepSpec: StepSpec, userId: string = "current") {
    return this._fetchJson<Step>('post', `/users/${userId}/steps`, JSON.stringify(newStepSpec));
  }

  getStepAnswer(stepId: number, formatting: AnswerFormatting, userId: string = 'current') {
    return this.sendRequest(Decode.ok, {
      method: 'post',
      path: `/users/${userId}/steps/${stepId}/answer/report`,
      body: JSON.stringify(formatting)
    });
  }

  // get step's answer in wdk default json output format
  getStepAnswerJson(stepId: number, formatConfig: AnswerJsonFormatConfig, userId: string = 'current') {
    return this.sendRequest(Decode.ok, {
      method: 'post',
      path: `/users/${userId}/steps/${stepId}/answer`,
      body: JSON.stringify(formatConfig)
    });
  }

  updateStep(stepId: number, stepSpec : StepSpec, userId: string = 'current') : Promise<Step> {
    let data = JSON.stringify(stepSpec);
    let url = `/users/${userId}/steps/${stepId}`;
   
    this._stepMap.set(stepId, this._fetchJson<never>('patch', url, data).catch(error => {
      // if the request fails, remove the response since a later request might succeed
      this._stepMap.delete(stepId);
      throw error;
    }));
    return this._stepMap.get(stepId)!;
  }

  getStrategies() {
    return this.sendRequest(Decode.arrayOf(strategyDecoder), {
      method: 'GET',
      path: '/users/current/strategies'
    })
  }

  // step filters are dynamically typed, so have to pass in the expected type
  getStepFilterSummary<T>(
    decoder: Decode.Decoder<T>,
    stepId: number,
    filterName: string,
    userId: string = 'current'
  ) {
    return this.sendRequest(decoder, {
      method: 'get',
      path: `/users/${userId}/steps/${stepId}/answer/filter-summary/${filterName}`
    })
  }

  getPublicStrategies(queryParams?: { userEmail: QueryString.ParsedUrlQuery[string] }) {
    const queryString = queryParams == null ? '' : '?' + QueryString.stringify(queryParams);
    return this.sendRequest(Decode.arrayOf(strategyDecoder), {
      method: 'GET',
      path: `/strategy-lists/public${queryString}`
    })
  }

  getOntology(name = '__wdk_categories__') {
    let recordClasses$ = this.getRecordClasses().then(rs => keyBy(rs, 'name'));
    let questions$ = this.getQuestions().then(qs => keyBy(qs, 'name'));
    let ontology$ = this._getFromCache('ontologies/' + name, () => {
      let rawOntology$ = this._fetchJson<Ontology<CategoryTreeNode>>('get', `/ontologies/${name}`);
      return Promise.all([ recordClasses$, questions$, rawOntology$ ])
      .then(([ recordClasses, questions, rawOntology ]) => {
        return sortOntology(recordClasses, questions,
          pruneUnknownPaths(recordClasses, questions, rawOntology));
      })
    });
    return Promise.all([ recordClasses$, questions$, ontology$ ])
      .then(([ recordClasses, questions, ontology ]) => {
        return resolveWdkReferences(recordClasses, questions, ontology);
      });
  }

  downloadAnswer(answerRequest: AnswerRequest, target = '_blank') {
    // a submission must trigger a form download, meaning we must POST the form
    submitAsForm({
      method: 'post',
      action: this.getAnswerServiceEndpoint(),
      target: target,
      inputs: {
        data: JSON.stringify(answerRequest)
      }
    });
  }

  createTemporaryFile(file: File): Promise<string> {
    const formData = new FormData();
    const path = '/temporary-file';
    formData.append('file', file, file.name);
    return fetch(this.serviceUrl + path, {
      method: 'POST',
      credentials: 'include',
      body: formData
    }).then(response => {
      if (response.ok) {
        const id = response.headers.get('ID');
        if (id == null) throw new Error("Expected response headers to include `ID`, but it was not.");
        return Promise.resolve(id);
      }
      return response.text().then(text => {
        throw new ServiceError(
          `Cannot POST ${path} (${response.status})`,
          text,
          response.status
        );
      })
    })
  }

  createDataset(config: DatasetConfig): Promise<Number> {
    return this.sendRequest(Decode.field('id', Decode.number), {
      path: '/users/current/datasets',
      method: 'POST',
      body: JSON.stringify(config)
    }).then(response => response.id)
  }

  getStepAnalysisTypes(stepId: number) {
    return this.sendRequest(
      Decode.arrayOf(stepAnalysisTypeDecoder),
      {
        path: `/users/current/steps/${stepId}/analysis-types`,
        method: 'GET'
      }
    );
  }

  async getStepAnalysisTypeParamSpecs(stepId: number, analysisTypeName: string) {
    const paramRefs = await this.sendRequest(
      parametersDecoder,
      {
        path: `/users/current/steps/${stepId}/analysis-types/${analysisTypeName}`,
        method: 'GET'
      }
    );

    return paramRefs.filter(({ isVisible }) => isVisible);
  }

  getAppliedStepAnalyses(stepId: number) {
    return this.sendRequest(
      Decode.arrayOf(stepAnalysisDecoder),
      {
        path: `/users/current/steps/${stepId}/analyses`,
        method: 'GET'
      }
    );
  }

  createStepAnalysis(stepId: number, analysisConfig: { displayName?: string, analysisName: string }) {
    return this.sendRequest(
      stepAnalysisConfigDecoder,
      {
        path: `/users/current/steps/${stepId}/analyses`,
        method: 'POST',
        body: JSON.stringify(analysisConfig)
      }
    );
  }

  deleteStepAnalysis(stepId: number, analysisId: number) {
    return this._fetchJson<void>(
      'DELETE',
      `/users/current/steps/${stepId}/analyses/${analysisId}`
    );
  }

  getStepAnalysis(stepId: number, analysisId: number) {
    return this.sendRequest(
      stepAnalysisConfigDecoder,
      {
        path: `/users/current/steps/${stepId}/analyses/${analysisId}`,
        method: 'GET'
      }
    )
  }

  updateStepAnalysisForm(stepId: number, analysisId: number, formParams: FormParams) {
    return fetch(`${this.serviceUrl}/users/current/steps/${stepId}/analyses/${analysisId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        formParams
      }),
      credentials: 'include',
      headers: new Headers(Object.assign({
        'Content-Type': 'application/json'
      }, this._version && {
        [CLIENT_WDK_VERSION_HEADER]: this._version
      }))
    })
      .then(response => response.ok ? '[]' : response.text())
      .then(validationErrors => {
        return JSON.parse(validationErrors);
      }) as Promise<string[]>;
  }

  renameStepAnalysis(stepId: number, analysisId: number, displayName: string) {
    return this._fetchJson<void>(
      'PATCH',
      `/users/current/steps/${stepId}/analyses/${analysisId}`,
      JSON.stringify({
        displayName
      })
    );
  }

  runStepAnalysis(stepId: number, analysisId: number) {
    return this.sendRequest(
      Decode.field('status', stepAnalysisStatusDecoder),
      {
        path: `/users/current/steps/${stepId}/analyses/${analysisId}/result`,
        method: 'POST'
      }
    );
  }

  getStepAnalysisResult(stepId: number, analysisId: number) {
    return this.sendRequest(
      Decode.ok,
      {
        path: `/users/current/steps/${stepId}/analyses/${analysisId}/result`,
        method: 'GET'
      }
    );
  }

  getStepAnalysisStatus(stepId: number, analysisId: number) {
    return this.sendRequest(
      Decode.field('status', stepAnalysisStatusDecoder),
      {
        path: `/users/current/steps/${stepId}/analyses/${analysisId}/result/status`,
        method: 'GET'
      }
    );
  }

  private _fetchJson<T>(method: string, url: string, body?: string) {
    return fetch(this.serviceUrl + url, {
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
  private _getFromCache<T>(key: string, onCacheMiss: () => Promise<T>) {
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

  private _checkStoreVersion() {
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

}

/**
 * Create a Map of `array` keyed by each element's `key` property.
 *
 * @param {Array<T>} array
 * @param {Function} getKey
 * @return {Map<T>}
 */
function makeIndex<T, U>(array: U[], getKey: (u: U) => T) {
  return array.reduce((index, item) => index.set(getKey(item), item), new Map<T, U>());
}

/**
 * Convert an object into query params by traversing top-level object
 * properties and coercing values into keys.
 * @param object
 * @return {string}
 */
function queryParams(object: { [key:string]: any}): string {
  return Object.keys(object)
    .map(key => key + '=' + object[key])
    .join('&');
}
