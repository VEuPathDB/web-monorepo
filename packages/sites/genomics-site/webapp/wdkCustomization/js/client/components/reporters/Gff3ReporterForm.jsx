import React from 'react';
import * as Wdk from 'wdk-client';

let { RadioList } = Wdk.Components;

let attachmentTypes = [
  { value: "text", display: "GFF File" },
  { value: "plain", display: "Show in Browser"}
];

let GffInputs = React.createClass({
  
  getChangeHandler(inputName) {
    return (() => {
      // all checkboxes, so for the given input, reverse its value (perform a NOT operation)
      this.props.onChange(Object.assign({}, this.props.formState,
          { [inputName]: !this.props.formState[inputName] }));
    });
  },

  render() {
    if (this.props.recordClass.name != "TranscriptRecordClasses.TranscriptRecordClass") {
      return ( <noscript/> );
    }
    return (
      <div style={{marginLeft:'2em'}}>
        <input type="checkbox" name="hasTranscript"
          checked={this.props.formState.hasTranscript} onChange={this.getChangeHandler('hasTranscript')}/>
        Include Predicted RNA/mRNA Sequence (introns spliced out)<br/>
        <input type="checkbox" name="hasProtein"
          checked={this.props.formState.hasProtein} onChange={this.getChangeHandler('hasProtein')}/>
        Include Predicted Protein Sequence<br/>
      </div>
    );
  }
});

let Gff3ReporterForm = React.createClass({

  componentDidMount() {
    let { formState, recordClass, onFormChange, onFormUiChange } = this.props;
    let newFormState = this.discoverFormState(formState, recordClass);
    onFormChange(newFormState);
    // currently no special UI state on this form
    onFormUiChange({});
  },

  discoverFormState(formState, recordClass) {
    return (formState != null ? formState :
      recordClass.name == "TranscriptRecordClasses.TranscriptRecordClass" ? {
        hasTranscript: false,
        hasProtein: false,
        attachmentType: 'plain'
      } : {
        attachmentType: 'plain'
      });
  },

  handleFormUpdate(valuesObject) {
    this.props.onFormChange(Object.assign({}, this.props.formState, valuesObject));
  },

  handleAttachmentTypeChange(newValue) {
    this.props.onFormChange(Object.assign({}, this.props.formState, { attachmentType: newValue }));
  },

  render() {
    let { formState, recordClass, onSubmit } = this.props;
    let realFormState = this.discoverFormState(formState, recordClass);
    return (
      <div>
        <h3>Generate a report of your query result in GFF3 format</h3>
        <GffInputs formState={realFormState} recordClass={recordClass} onChange={this.handleFormUpdate}/>
        <div>
          <h3>Download Type:</h3>
          <div style={{marginLeft:"2em"}}>
            <RadioList name="attachmentType" value={realFormState.attachmentType}
                onChange={this.handleAttachmentTypeChange} items={attachmentTypes}/>
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