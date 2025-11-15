import React from 'react';
import { RadioList, Checkbox } from '@veupathdb/wdk-client/lib/Components';
import * as ComponentUtils from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import * as ReporterUtils from '@veupathdb/wdk-client/lib/Views/ReporterForm/reporterUtils';
import { RecordClass } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { State } from '@veupathdb/wdk-client/lib/StoreModules/DownloadFormStoreModule';

const util = Object.assign({}, ComponentUtils, ReporterUtils);

const attachmentTypes = [
  { value: 'text', display: 'GFF File' },
  { value: 'plain', display: 'Show in Browser' },
];

interface GffInputsProps {
  recordClass: RecordClass;
  formState: Gff3FormState;
  getUpdateHandler: (fieldName: string) => (value: any) => void;
}

const GffInputs: React.FC<GffInputsProps> = (props) => {
  // RRD 4/7/20: Hide sequence flags for transcripts too until GffCachedReporter fixed
  //if (recordClass.fullName != "TranscriptRecordClasses.TranscriptRecordClass") {
  return <noscript />;
  /*}
  return (
    <div style={{marginLeft:'2em'}}>
      <Checkbox value={formState.hasTranscript} onChange={getUpdateHandler('hasTranscript')}/>
      Include Predicted RNA/mRNA Sequence (introns spliced out)<br/>
      <Checkbox value={formState.hasProtein} onChange={getUpdateHandler('hasProtein')}/>
      Include Predicted Protein Sequence<br/>
    </div>
  );*/
};

interface Gff3ReporterFormProps {
  formState: Gff3FormState;
  recordClass: RecordClass;
  updateFormState: (state: Gff3FormState) => void;
  onSubmit: () => void;
  includeSubmit: boolean;
}

interface Gff3FormState {
  attachmentType: string;
  hasTranscript?: boolean;
  hasProtein?: boolean;
}

interface Gff3FormUiState {}

const Gff3ReporterForm: React.FC<Gff3ReporterFormProps> & {
  getInitialState: (downloadFormStoreState: State) => {
    formState: Gff3FormState;
    formUiState: Gff3FormUiState;
  };
} = (props) => {
  const { formState, recordClass, updateFormState, onSubmit, includeSubmit } =
    props;
  const getUpdateHandler = (fieldName: string) =>
    util.getChangeHandler(fieldName, updateFormState, formState);
  return (
    <div className="eupathdb-ReporterFormWrapper">
      <h3>Generate a report of your query result in GFF3 format</h3>
      <GffInputs
        formState={formState}
        recordClass={recordClass}
        getUpdateHandler={getUpdateHandler}
      />
      <div>
        <h3>Download Type:</h3>
        <div style={{ marginLeft: '2em' }}>
          <RadioList
            name="attachmentType"
            value={formState.attachmentType}
            onChange={getUpdateHandler('attachmentType')}
            items={attachmentTypes}
          />
        </div>
      </div>
      {includeSubmit && (
        <div className="eupathdb-ReporterFormSubmit">
          <button className="btn" type="submit" onClick={onSubmit}>
            Get GFF3 file
          </button>
        </div>
      )}
    </div>
  );
};

const initialStateMap: Record<string, Gff3FormState> = {
  'SequenceRecordClasses.SequenceRecordClass': {
    attachmentType: 'plain',
  },
  'TranscriptRecordClasses.TranscriptRecordClass': {
    hasTranscript: false,
    hasProtein: false,
    attachmentType: 'plain',
  },
};

Gff3ReporterForm.getInitialState = (downloadFormStoreState: State) => {
  const recordClassFullName =
    downloadFormStoreState.recordClass?.fullName || '';
  return {
    formState:
      recordClassFullName in initialStateMap
        ? initialStateMap[recordClassFullName]
        : { attachmentType: 'plain' },
    formUiState: {},
  };
};

export default Gff3ReporterForm;
