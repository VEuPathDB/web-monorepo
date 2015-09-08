import Wdk from 'wdk';
import {
  DatasetRecord,
  Tooltip
} from './records/DatasetRecordClasses.DatasetRecordClass';

let recordComponentsMap = {
  "DatasetRecordClasses.DatasetRecordClass": DatasetRecord
};

Wdk.client.components.Record.wrapComponent(function(Record) {
  let RecordComponentResolver =  React.createClass({
    render() {
      let Component = recordComponentsMap[this.props.recordClass.fullName] || Record;
      return (
        <Component {...this.props}/>
      );
    }
  });
  return RecordComponentResolver;
});

// Wdk.client.components.AnswerTableCell.wrapComponent(function(AnswerTableCell) {
//   return React.createClass({
//     render() {
//       let cell = <AnswerTableCell {...this.props}/>;
// 
//       if (this.props.recordClass === "DatasetRecordClasses.DatasetRecordClass"
//          && this.props.attribute.name === "primary_key") {
//         return (
//           <Tooltip text={this.props.record.attributes.description.value} witdh={this.props.width}>
//             {cell}
//           </Tooltip>
//         );
//       }
// 
//       return cell;
//     }
//   });
// });

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
