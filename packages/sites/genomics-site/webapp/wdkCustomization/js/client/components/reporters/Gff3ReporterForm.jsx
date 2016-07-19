import * as Wdk from 'wdk-client';

let util = Object.assign({}, Wdk.ComponentUtils, Wdk.ReporterUtils);
let { RadioList, Checkbox } = Wdk.Components;

let attachmentTypes = [
  { value: "text", display: "GFF File" },
  { value: "plain", display: "Show in Browser"}
];

let GffInputs = props => {
  let { recordClass, formState, getUpdateHandler } = props;
  if (recordClass.name != "TranscriptRecordClasses.TranscriptRecordClass") {
    return ( <noscript/> );
  }
  return (
    <div style={{marginLeft:'2em'}}>
      <Checkbox value={formState.hasTranscript} onChange={getUpdateHandler('hasTranscript')}/>
      Include Predicted RNA/mRNA Sequence (introns spliced out)<br/>
      <Checkbox value={formState.hasProtein} onChange={getUpdateHandler('hasProtein')}/>
      Include Predicted Protein Sequence<br/>
    </div>
  );
};

let Gff3ReporterForm = props => {
  let { formState, recordClass, updateFormState, onSubmit } = props;
  let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, updateFormState, formState);
  return (
    <div>
      <h3>Generate a report of your query result in GFF3 format</h3>
      <GffInputs formState={formState} recordClass={recordClass} getUpdateHandler={getUpdateHandler}/>
      <div>
        <h3>Download Type:</h3>
        <div style={{marginLeft:"2em"}}>
          <RadioList name="attachmentType" value={formState.attachmentType}
              onChange={getUpdateHandler('attachmentType')} items={attachmentTypes}/>
        </div>
      </div>
      <div className="eupathdb-ReporterFormSubmit">
        <input type="submit" value="Submit" onClick={onSubmit}/>
      </div>
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
  let recordClassName = downloadFormStoreState.recordClass.name;
  return {
    formState: (recordClassName in initialStateMap ? initialStateMap[recordClassName] : {}),
    formUiState: {}
  };
};

export default Gff3ReporterForm;
