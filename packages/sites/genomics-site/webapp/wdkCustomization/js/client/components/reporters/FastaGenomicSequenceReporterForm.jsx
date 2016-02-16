import React from 'react';
import * as Wdk from 'wdk-client';
import SrtHelp from '../common/SrtHelp';

let util = Object.assign({}, Wdk.ComponentUtils, Wdk.ReporterUtils);
let { RadioList, Checkbox, TextBox } = Wdk.Components;

let defaultFormState = {
  attachmentType: 'plain',
  revComp: true,
  start: 1,
  end: 0
};

let FastaGenomicSequenceReporterForm = React.createClass({

  componentDidMount() {
    this.props.initializeFormState(this.discoverFormState(this.props.formState));
  },

  discoverFormState(formState) {
    return (formState != null ? formState : defaultFormState);
  },

  // returns a handler function that will update the form state 
  getUpdateHandler(fieldName) {
    return util.getChangeHandler(fieldName, this.props.onFormChange, this.props.formState);
  },

  render() {
    let realFormState = this.discoverFormState(this.props.formState);
    return (
      <div>
        <h3>Choose the region of the sequence(s):</h3>
        <div style={{margin:"2em"}}>
          <Checkbox value={realFormState.revComp} onChange={this.getUpdateHandler('revComp')}/> Reverse & Complement
        </div>
        <div style={{margin:"2em"}}>
          <b>Nucleotide positions:</b>
          <TextBox value={realFormState.start} onChange={this.getUpdateHandler('start')} size="6"/> to
          <TextBox value={realFormState.end} onChange={this.getUpdateHandler('end')} size="6"/> (0 = end)
        </div>
        <hr/>
        <h3>Download Type:</h3>
        <div style={{marginLeft:"2em"}}>
          <RadioList value={realFormState.attachmentType} items={util.attachmentTypes}
              onChange={this.getUpdateHandler('attachmentType')}/>
        </div>
        <div style={{margin:'0.8em'}}>
          <input type="button" value="Get Sequences" onClick={this.props.onSubmit}/>
        </div>
        <div>
          <hr/>
          <h3>Options:</h3>
          <ul>
            <li>
              <i><b>complete sequence</b></i> to retrieve the complete sequence
              for the requested genomic regions, use "Nucleotide positions 1 to 10000"
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
