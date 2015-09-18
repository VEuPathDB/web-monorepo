import Wdk from 'wdk';

// Import custom components
import {
  DatasetRecord
} from './records/DatasetRecordClasses.DatasetRecordClass';


// Customize the Record component
Wdk.client.components.Record.wrapComponent(function(Record) {
  // Map record class names to custom components
  function recordComponent(recordClassName) {
    switch (recordClassName) {
      case 'DatasetRecordClasses.DatasetRecordClass':
        return DatasetRecord;

      default:
        return Record;
    }
  }

  // This React component will delegate to custom components defined in the
  // Object defined above.
  let RecordComponentResolver =  React.createClass({
    render() {
      let Component = recordComponent(this.props.recordClass.fullName);
      return (
        <Component {...this.props}/>
      );
    }
  });

  return RecordComponentResolver;
});


// Bootstrap the WDK client application

// getApiClientConfig() is defined in /client/index.jsp
let config = window.getApiClientConfig();
let app = window._app = Wdk.client.createApplication({
  rootUrl: config.rootUrl,
  endpoint: config.endpoint,
  rootElement: config.rootElement
});

// TODO Convert initialData to an action
if (config.initialData) {
  let action = config.initialData;
  app.store.dispatch(action);
}
