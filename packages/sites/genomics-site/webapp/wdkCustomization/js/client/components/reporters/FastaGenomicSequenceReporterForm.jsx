import React from 'react';
import * as Wdk from 'wdk-client';
import SrtHelp from '../common/SrtHelp';

let { RadioList } = Wdk.Components;

let attachmentTypes = [
  { value: "text", display: "Text File" },
  { value: "plain", display: "Show in Browser"}
];

let defaultFormState = {
  attachmentType: 'plain',
  revComp: true,
  start: 1,
  end: 0
};

let TextBox = function(props) {
  let onChange = function(event) {
    props.onChange(event.target.value);
  };
  return ( <input type="text" {...props} onChange={onChange}/> );
}

let FastaGenomicSequenceReporterForm = React.createClass({

  componentDidMount() {
    this.props.onFormChange(this.discoverFormState(this.props.formState));
  },

  discoverFormState(formState) {
    return (formState != null ? formState : defaultFormState);
  },

  // returns a handler function that will update the form state 
  getUpdateHandler(fieldName) {
    return (newValue => {
      this.props.onFormChange(Object.assign({}, this.props.formState, { [fieldName]: newValue }));
    });
  },

  render() {
    let realFormState = this.discoverFormState(this.props.formState);
    return (
      <div>
        <h3>Choose the region of the sequence(s):</h3>
        <div style={{marginLeft:"2em"}}>
          <input type="checkbox" name="revComp" checked={realFormState.revComp}/> Reverse & Complement" +
        </div>
        <div style={{marginLeft:"2em"}}>
          <b>Nucleotide positions:</b>
          <TextBox name="start" value={realFormState.start} size="6"> to
          <TextBox name="end" value={realFormState.end} size="6">
        </div>
        <hr/>
        <h3>Download Type:</h3>
        <div style={{marginLeft:"2em"}}>
          <RadioList name="attachmentType" value={realFormState.attachmentType}
            onChange={this.getUpdateHandler('attachmentType')} items={attachmentTypes}/>
        </div>
        <div style={{margin:'0.8em'}}>
          <input type="button" value="Get Sequences" onClick={this.props.onSubmit}/>
        </div>
        <div>
          <hr/>
          <h3>Options:<h3>
          <ul>
            <li>
              <i><b>complete sequence</b></i> to retrieve the complete sequence
              for the requested genomic regions, use "Nucleotide positions 1 to 0"
            </li>
            <li>
              <i><b>specific sequence region</b></i> to retrieve a specific region
              for the requested genomic regions, use "Nucleotide positions "
              <i>x</i> to <i>y</i>, where <i>y</i> is greater than <i>x</i>
            </li>
          </ul>
          <hr/>
        </div>
        <SrtHelp/>
      </div>
    );
  }

});

export default FastaGenomicSequenceReporterForm;
