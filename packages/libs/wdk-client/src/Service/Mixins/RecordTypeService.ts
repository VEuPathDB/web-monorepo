import { keyBy } from 'lodash';
import { ServiceBaseClass } from 'wdk-client/Service/ServiceBase';
import { RecordClass } from 'wdk-client/Utils/WdkModel';
import { ServiceError } from 'wdk-client/Utils/WdkService';

export default (base: ServiceBaseClass) => class RecordTypeService extends base {
  /** Get all RecordClasses defined in WDK Model. */
  getRecordClasses(): Promise<RecordClass[]> {
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

  /** Get the first RecordClass that matches `test`. */
  findRecordClass(test: (recordClass: RecordClass) => boolean): Promise<RecordClass> {
    return this.getRecordClasses().then(rs => {
      let record = rs.find(test);
      if (record == null) {
        throw new ServiceError("Could not find record class.", "Not found", 404);
      }
      return record;
    });
  }
}
