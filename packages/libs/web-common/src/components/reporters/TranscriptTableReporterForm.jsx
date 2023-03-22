import React from 'react';
import TableReporterForm from './TableReporterForm';

// Transcript Table Reporter is the same as a regular Table Reporter, but need to
//   override the recordClass (Transcript) with Gene to get Gene tables for a Transcript result
let recordClassOverride = { recordClass: { fullName: "GeneRecordClasses.GeneRecordClass" } };

/** @type import('./Types').ReporterFormComponent */
let TranscriptTableReporterForm = props => {
  let newProps = Object.assign({}, props, recordClassOverride);
  return (<TableReporterForm {...newProps}/>);
}

TranscriptTableReporterForm.getInitialState = (downloadFormStoreState) => {
  let newDownloadFormStoreState = Object.assign({}, downloadFormStoreState, recordClassOverride);
  return TableReporterForm.getInitialState(newDownloadFormStoreState);
}

export default TranscriptTableReporterForm;
