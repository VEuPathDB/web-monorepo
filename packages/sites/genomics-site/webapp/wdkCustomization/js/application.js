import Wdk from 'wdk';
import {
  DatasetRecord,
  Tooltip
} from './records/DatasetRecordClasses.DatasetRecordClass';

let rootElement = document.getElementsByTagName('main')[0];
let rootUrl = rootElement.getAttribute('data-baseUrl');
let endpoint = rootElement.getAttribute('data-serviceUrl');

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

let app = window._app = Wdk.client.createApplication({
  rootUrl,
  endpoint,
  rootElement
});

// Get POSTed data and dispatch as an action
let postData = apicommGetPostData();
app.store.dispatch(postData);
