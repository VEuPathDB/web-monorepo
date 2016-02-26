export function findComponent(componentName, recordClassName) {
  try {
     let record = require('./records/' + recordClassName);
     return record[componentName];
  }
  catch(e) {
    // ignore error
  }
}
