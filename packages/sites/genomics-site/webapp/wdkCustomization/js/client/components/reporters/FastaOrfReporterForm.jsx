import React from 'react';
import * as Wdk from 'wdk-client';
import SrtHelp from '../common/SrtHelp';

let util = Object.assign({}, Wdk.ComponentUtils, Wdk.ReporterUtils);
let { TextBox, RadioList, SingleSelect } = Wdk.Components;

let sequenceTypes = [
  { value: 'genomic', display: 'Genomic' },
  { value: 'protein', display: 'Protein' }
];

let genomicAnchorValues = [
  { value: 'Start', display: 'Start' },
  { value: 'End', display: 'Stop' }
];

let signs = [
  { value: 'plus', display: '+' },
  { value: 'minus', display: '-' }
];

let defaultFormState = {
  attachmentType: 'plain',
  type: 'genomic',

  // sequence region inputs for 'genomic'
  upstreamAnchor: 'Start',
  upstreamSign: 'plus',
  upstreamOffset: 0,
  downstreamAnchor: 'End',
  downstreamSign: 'plus',
  downstreamOffset: 0
};

let SequenceRegionRange = props => {
  let { label, anchor, sign, offset, formState, getUpdateHandler } = props;
  return (
    <div>
      <span>{label}</span>
      <SingleSelect name={anchor} value={formState[anchor]}
          onChange={getUpdateHandler(anchor)} items={genomicAnchorValues}/>
      <SingleSelect name={sign} value={formState[sign]}
          onChange={getUpdateHandler(sign)} items={signs}/>
      <TextBox name={offset} value={formState[offset]}
          onChange={getUpdateHandler(offset)} size="6"/>
      nucleotides
    </div>
  );
};

let SequenceRegionInputs = props => {
  let { formState, getUpdateHandler } = props;
  return (formState.type != 'genomic' ? ( <noscript/> ) : (
    <div>
      <h3>Choose the region of the sequence(s):</h3>
      <SequenceRegionRange label="Begin at" anchor="upstreamAnchor" sign="upstreamSign"
        offset="upstreamOffset" formState={formState} getUpdateHandler={getUpdateHandler}/>
      <SequenceRegionRange label="End at" anchor="downstreamAnchor" sign="downstreamSign"
        offset="downstreamOffset" formState={formState} getUpdateHandler={getUpdateHandler}/>
    </div>
  ));
};

let FastaOrfReporterForm = React.createClass({

  componentDidMount() {
    this.props.onFormChange(this.discoverFormState(this.props.formState));
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
        <h3>Choose the type of sequence:</h3>
        <div style={{marginLeft:"2em"}}>
          <RadioList name="type" value={realFormState.type}
              onChange={this.getUpdateHandler('type')} items={sequenceTypes}/>
        </div>
        <SequenceRegionInputs formState={realFormState} getUpdateHandler={this.getUpdateHandler}/>
        <hr/>
        <h3>Download Type:</h3>
        <div style={{marginLeft:"2em"}}>
          <RadioList name="attachmentType" value={realFormState.attachmentType}
            onChange={this.getUpdateHandler('attachmentType')} items={util.attachmentTypes}/>
        </div>
        <div style={{margin:'0.8em'}}>
          <input type="button" value="Get Sequences" onClick={this.props.onSubmit}/>
        </div>
        <SrtHelp/>
      </div>
    );
  }
});

export default FastaOrfReporterForm;
