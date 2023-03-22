import React from 'react';
import { RadioList, Checkbox } from '@veupathdb/wdk-client/lib/Components';
import * as ComponentUtils from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import * as ReporterUtils from '@veupathdb/wdk-client/lib/Views/ReporterForm/reporterUtils';

let util = Object.assign({}, ComponentUtils, ReporterUtils);

let attachmentTypes = [
  { value: "text", display: "GFF File" },
  { value: "plain", display: "Show in Browser"}
];

let GffInputs = props => {
  let { recordClass, formState, getUpdateHandler } = props;
  // RRD 4/7/20: Hide sequence flags for transcripts too until GffCachedReporter fixed
  //if (recordClass.fullName != "TranscriptRecordClasses.TranscriptRecordClass") {
    return ( <noscript/> );
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

/** @type import('./Types').ReporterFormComponent */
let Gff3ReporterForm = props => {
  let { formState, recordClass, updateFormState, onSubmit, includeSubmit  } = props;
  let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, updateFormState, formState);
  return (
    <div className='eupathdb-ReporterFormWrapper'>
      <h3>Generate a report of your query result in GFF3 format</h3>
      <GffInputs formState={formState} recordClass={recordClass} getUpdateHandler={getUpdateHandler}/>
      <div>
        <h3>Download Type:</h3>
        <div style={{marginLeft:"2em"}}>
          <RadioList name="attachmentType" value={formState.attachmentType}
              onChange={getUpdateHandler('attachmentType')} items={attachmentTypes}/>
        </div>
      </div>
      { includeSubmit &&
        <div className="eupathdb-ReporterFormSubmit">
          <button className="btn" type="submit" onClick={onSubmit}>Get GFF3 file</button>
        </div>
      }
    </div>
  );
};

let initialStateMap = {
  "SequenceRecordClasses.SequenceRecordClass": {
    attachmentType: 'plain'
  },
  "TranscriptRecordClasses.TranscriptRecordClass": {
    hasTranscript: false,
    hasProtein: false,
    attachmentType: 'plain'
  }
};

Gff3ReporterForm.getInitialState = (downloadFormStoreState) => {
  let recordClassFullName = downloadFormStoreState.recordClass.fullName;
  return {
    formState: (recordClassFullName in initialStateMap ? initialStateMap[recordClassFullName] : {}),
    formUiState: {}
  };
};

export default Gff3ReporterForm;
