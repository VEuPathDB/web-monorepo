import * as Wdk from 'wdk-client';
import TableReporterForm from './TableReporterForm';

let util = Object.assign({}, Wdk.ComponentUtils, Wdk.ReporterUtils);

let TranscriptTableReporterForm = props => {
  let newProps = Object.assign({}, props, { recordClass: { name: "GeneRecordClasses.GeneRecordClass" } });
  return (<TableReporterForm {...newProps}/>);
}

TranscriptTableReporterForm.getInitialState = TableReporterForm.getInitialState;

export default TranscriptTableReporterForm;
