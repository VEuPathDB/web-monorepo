import React from 'react';
import * as Wdk from 'wdk-client';

let util = Object.assign({}, Wdk.ComponentUtils, Wdk.ReporterUtils);
let { RadioList, Checkbox } = Wdk.Components;

let attachmentTypes = [
  { value: "text", display: "GFF File" },
  { value: "plain", display: "Show in Browser"}
];

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

let Gff3ReporterForm = React.createClass({

  componentDidMount() {
    let { formState, recordClass, initializeFormState } = this.props;
    initializeFormState(this.discoverFormState(formState, recordClass));
  },

  discoverFormState(formState, recordClass) {
    return (formState != null ? formState :
      recordClass.name in initialStateMap ?
      initialStateMap[recordClass.name] : {});
  },

  // returns a handler function that will update the form state 
  getUpdateHandler(fieldName) {
    return util.getChangeHandler(fieldName, this.props.onFormChange, this.props.formState);
  },

  render() {
    let { formState, recordClass, onSubmit } = this.props;
    let realFormState = this.discoverFormState(formState, recordClass);
    return (
      <div>
        <h3>Generate a report of your query result in GFF3 format</h3>
        <GffInputs formState={realFormState} recordClass={recordClass} getUpdateHandler={this.getUpdateHandler}/>
        <div>
          <h3>Download Type:</h3>
          <div style={{marginLeft:"2em"}}>
            <RadioList name="attachmentType" value={realFormState.attachmentType}
                onChange={this.getUpdateHandler('attachmentType')} items={attachmentTypes}/>
          </div>
        </div>
        <div style={{width:'30em',textAlign:'center', margin:'0.6em 0'}}>
          <input type="button" value="Submit" onClick={onSubmit}/>
        </div>
      </div>
    );
  }
});

export default Gff3ReporterForm;
