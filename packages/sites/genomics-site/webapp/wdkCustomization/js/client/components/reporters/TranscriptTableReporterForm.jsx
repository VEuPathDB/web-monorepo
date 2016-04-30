import * as Wdk from 'wdk-client';
import TableReporterForm from './TableReporterForm';

let util = Object.assign({}, Wdk.ComponentUtils, Wdk.ReporterUtils);

// Transcript Table Reporter is the same as a regular Table Reporter, but need to
//   override the recordClass (Transcript) with Gene to get Gene tables for a Transcript result
let recordClassOverride = { recordClass: { name: "GeneRecordClasses.GeneRecordClass" } };

let TranscriptTableReporterForm = props => {
  let newProps = Object.assign({}, props, recordClassOverride);
  return (<TableReporterForm {...newProps}/>);
}

TranscriptTableReporterForm.getInitialState = (downloadFormStoreState, userStoreState) => {
  let newDownloadFormStoreState = Object.assign({}, downloadFormStoreState, recordClassOverride);
  return TableReporterForm.getInitialState(newDownloadFormStoreState, userStoreState);
}

export default TranscriptTableReporterForm;
