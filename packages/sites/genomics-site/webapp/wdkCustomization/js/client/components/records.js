export function findComponent(componentName, recordClassName) {
  let record = require('./records/' + recordClassName);
  if (record != null) {
    return record[componentName];
  }
}
