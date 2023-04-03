import { keyBy } from 'lodash';
import { v4 as uuid } from 'uuid';
import { ServiceBase } from '../../Service/ServiceBase';
import { RecordClass } from '../../Utils/WdkModel';
import { ServiceError } from '../../Service/ServiceError';

export default (base: ServiceBase) => {
  /** Get all RecordClasses defined in WDK Model. */
  function getRecordClasses(): Promise<RecordClass[]> {
    let url = '/record-types?format=expanded';
    return base._getFromCache(url, () =>
      base._fetchJson<RecordClass[]>('get', url).then((recordClasses) => {
        // create indexes by name property for attributes and tables
        // this is done after recordClasses have been retrieved from the store
        // since it cannot reliably serialize Maps
        return recordClasses.map((recordClass) =>
          Object.assign(recordClass, {
            attributesMap: keyBy(recordClass.attributes, 'name'),
            tablesMap: keyBy(recordClass.tables, 'name'),
          })
        );
      })
    );
  }

  /** Get the first RecordClass that matches `test`. */
  function findRecordClass(urlSegment: string): Promise<RecordClass> {
    return base.getRecordClasses().then((rs) => {
      let record = rs.find((r) => r.urlSegment === urlSegment);
      if (record == null) {
        throw new ServiceError(
          'Could not find record class.',
          'Not found',
          404,
          uuid()
        );
      }
      return record;
    });
  }

  return {
    getRecordClasses,
    findRecordClass,
  };
};
