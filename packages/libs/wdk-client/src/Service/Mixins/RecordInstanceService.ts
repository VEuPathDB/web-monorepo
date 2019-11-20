import stringify from 'json-stable-stringify';
import { difference } from 'lodash';

import { ServiceBase } from 'wdk-client/Service/ServiceBase';
import { PrimaryKey, RecordInstance } from 'wdk-client/Utils/WdkModel';

interface RecordRequest {
  attributes: string[];
  tables: string[];
  primaryKey: PrimaryKey;
}

export default (base: ServiceBase) => {

  const cache: Map<string, {request: RecordRequest; response: Promise<RecordInstance>}> = new Map;

  /**
   * Get a record instance identified by the provided record class and primary
   * key, with the configured tables and attributes.
   *
   * The record instance will be stored in memory. Any subsequent requests will
   * be merged with the in-memory request.
   *
   * XXX Use _getFromCache with key of "recordInstance" so the most recent record is saved??
   */
  function getRecord(recordClassUrlSegment: string, primaryKey: PrimaryKey, options: {attributes?: string[]; tables?: string[];} = {}) {
    let cacheKey = recordClassUrlSegment + ':' + stringify(primaryKey);
    let method = 'post';
    let url = '/record-types/' + recordClassUrlSegment + '/records';

    let { attributes = [], tables = [] } = options;
    let cacheEntry = cache.get(cacheKey);

    // if we don't have the record, fetch whatever is requested
    if (cacheEntry == null) {
      let request = { attributes, tables, primaryKey };
      let response = base._fetchJson<RecordInstance>(method, url, stringify(request));
      cacheEntry = { request, response };
      cache.set(cacheKey, cacheEntry);
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
        let newResponse = base._fetchJson<RecordInstance>(method, url, stringify(newRequest));

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
        cache.set(cacheKey, cacheEntry);
      }
    }

    return cacheEntry.response;
  }

  return {
    getRecord
  }
}
