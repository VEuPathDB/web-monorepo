import Wdk from 'wdk/flux';
import {
  DatasetRecord,
  datasetCellRenderer
} from './records/DatasetRecordClasses.DatasetRecordClass';

var rootElement = document.getElementsByTagName('main')[0];
var baseUrl = rootElement.getAttribute('data-baseUrl');
var serviceUrl = rootElement.getAttribute('data-serviceUrl');

Wdk.createApplication({
  baseUrl                 : baseUrl,
  serviceUrl              : serviceUrl,
  rootElement             : rootElement,
  recordComponentResolver : recordComponentResolver,
  cellRendererResolver    : cellRendererResolver
});

// This is called when rendering the record page. `DefaultComponent` is
// passed as a child to the component returned by this function. This
// makes it possible to decorate the default component, or to replace it.
function recordComponentResolver(recordClassName, DefaultComponent) {
  switch (recordClassName) {
    case "DatasetRecordClasses.DatasetRecordClass":
      return DatasetRecord;
    default:
      return DefaultComponent;
  }
}

// This is called when rendering a table cell. `defaultRenderer` is passed
// as an argument to the function returned by this function. This makes it
// possible to decorate the default renderer, or to replace it.
function cellRendererResolver(recordClassName, defaultRenderer) {
  switch (recordClassName) {
    case "DatasetRecordClasses.DatasetRecordClass":
      return datasetCellRenderer;
    default:
      return defaultRenderer;
  }
}
