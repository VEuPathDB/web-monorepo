/**
 * Dynamically resolve `componentName` to a React Component object by checking
 * for a an export of the same name in the recordClass module. The recordClass
 * module may not exist, in which case we will simply return undefined.
 */
export function findComponent(componentName, recordClassName) {
  try {
     let record = require('./records/' + recordClassName);
     return record[componentName];
  }
  catch(e) {
    // ignore error
  }
}
