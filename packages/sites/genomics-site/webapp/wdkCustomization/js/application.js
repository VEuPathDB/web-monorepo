import Wdk from 'wdk';
import {
  DatasetRecord,
  datasetCellRenderer
} from './records/DatasetRecordClasses.DatasetRecordClass';

var rootElement = document.getElementsByTagName('main')[0];
var rootUrl = rootElement.getAttribute('data-baseUrl');
var endpoint = rootElement.getAttribute('data-serviceUrl');

window._app = Wdk.flux.createApplication({
  rootUrl,
  endpoint,
  rootElement,
  recordComponentResolver,
  cellRendererResolver
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
