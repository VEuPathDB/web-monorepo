import React from 'react';
import TableReporterForm from './TableReporterForm';
import { OrganismParam } from '@veupathdb/preferred-organisms/lib/Components';

// Transcript Table Reporter is the same as a regular Table Reporter, but need to
//   override the recordClass (Transcript) with Gene to get Gene tables for a Transcript result
let recordClassOverride = {
  recordClass: { fullName: 'GeneRecordClasses.GeneRecordClass' },
};

/** @type import('./Types').ReporterFormComponent */
let TranscriptTableReporterForm = (props) => {
  let orgPicker =
    props.formState.tables.length !== 0 && props.formState.tables[0] === 'Orthologs' ? (
      <div>
        <h3>Select organisms for which orthologs will be returned</h3>
        { /* <OrganismParam /> */ }
        <p>There will be an organism param here!</p>
      </div>
    ) : null;
  let newProps = Object.assign({}, props, recordClassOverride, { postTableSelectionElement: orgPicker });
  return <TableReporterForm {...newProps} />;
};

TranscriptTableReporterForm.getInitialState = (downloadFormStoreState) => {
  let newDownloadFormStoreState = Object.assign(
    {},
    downloadFormStoreState,
    recordClassOverride,
    { orthologOrganisms: [] }
  );
  return TableReporterForm.getInitialState(newDownloadFormStoreState);
};

export default TranscriptTableReporterForm;
