import React from 'react';
import TableReporterForm from './TableReporterForm';
import { ReporterFormComponent } from './Types';

// Transcript Table Reporter is the same as a regular Table Reporter, but need to
//   override the recordClass (Transcript) with Gene to get Gene tables for a Transcript result
const recordClassOverride = {
  recordClass: { fullName: 'GeneRecordClasses.GeneRecordClass' },
};

const TranscriptTableReporterForm: ReporterFormComponent = (props) => {
  const newProps = Object.assign({}, props, recordClassOverride);
  return <TableReporterForm {...newProps} />;
};

TranscriptTableReporterForm.getInitialState = (downloadFormStoreState: any) => {
  const newDownloadFormStoreState = Object.assign(
    {},
    downloadFormStoreState,
    recordClassOverride
  );
  return TableReporterForm.getInitialState(newDownloadFormStoreState);
};

export default TranscriptTableReporterForm;
