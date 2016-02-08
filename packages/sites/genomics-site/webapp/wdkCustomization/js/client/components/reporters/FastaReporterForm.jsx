import React from 'react';
import * as Wdk from 'wdk-client';
import SrtHelp from '../common/SrtHelp';

let { RadioList, SingleSelect } = Wdk.Components;
let FormSubmitter = Wdk.FormSubmitter;

let sequenceTypes = [
  { value: 'genomic', display: 'Genomic' },
  { value: 'protein', display: 'Protein' },
  { value: 'CDS', display: 'CDS' },
  { value: 'processed_transcript', display: 'Transcript' }
];

let genomicAnchorValues = [
  { value: 'Start', display: 'Transcription Start***' },
  { value: 'CodeStart', display: 'Translation Start (ATG)' },
  { value: 'CodeEnd', display: 'Translation Stop Codon' },
  { value: 'End', display: 'Transcription Stop***' }
];

let proteinAnchorValues = [
  { value: 'Start', display: 'Downstream from Start' },
  { value: 'End', display: 'Upstream from End' }
];

let signs = [
  { value: 'plus', display: '+' },
  { value: 'minus', display: '-' }
];

let attachmentTypes = [
  { value: "text", display: "Text File" },
  { value: "plain", display: "Show in Browser"}
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
  downstreamOffset: 0,

  // sequence region inputs for 'protein'
  startAnchor3: 'Start',
  startOffset3: 0,
  endAnchor3: 'End',
  endOffset3: 0
};

let TextBox = function(props) {
  let onChange = function(event) {
    props.onChange(event.target.value);
  };
  return ( <input type="text" {...props} onChange={onChange}/> );
}

let SequenceRegionInputs = function(props) {
  let { formState, getUpdateHandler } = props;
  switch (formState.type) {
    case 'genomic':
      return (
        <div>
          <h3>Choose the region of the sequence(s):</h3>
          <div>
            <span>Begin at</span>
            <SingleSelect name="upstreamAnchor" value={formState.upstreamAnchor}
                onChange={getUpdateHandler('upstreamAnchor')} items={genomicAnchorValues}/>
            <SingleSelect name="upstreamSign" value={formState.upstreamSign}
                onChange={getUpdateHandler('upstreamSign')} items={signs}/>
            <TextBox name="upstreamOffset" value={formState.upstreamOffset}
                onChange={getUpdateHandler('upstreamOffset')} size="6"/>
            nucleotides
          </div>
          <div>
            <span>End at</span>
            <SingleSelect name="downstreamAnchor" value={formState.downstreamAnchor}
                onChange={getUpdateHandler('downstreamAnchor')} items={genomicAnchorValues}/>
            <SingleSelect name="downstreamSign" value={formState.downstreamSign}
                onChange={getUpdateHandler('downstreamSign')} items={signs}/>
            <TextBox name="downstreamOffset" value={formState.downstreamOffset}
                onChange={getUpdateHandler('downstreamOffset')} size="6"/>
            nucleotides
          </div>
        </div>
      );
    case 'protein':
      return (
        <div>
          <h3>Choose the region of the protein sequence(s):</h3>
          <div>
            <span>Begin at</span>
            <SingleSelect name="startAnchor3" value={formState.startAnchor3}
                onChange={getUpdateHandler('startAnchor3')} items={proteinAnchorValues}/>
            <TextBox name="startOffset3" value={formState.startOffset3}
                onChange={getUpdateHandler('startOffset3')} size="6"/>
            aminoacids
          </div>
          <div>
            <span>End at</span>
            <SingleSelect name="endAnchor3" value={formState.endAnchor3}
                onChange={getUpdateHandler('endAnchor3')} items={proteinAnchorValues}/>
            <TextBox name="endOffset3" value={formState.endOffset3}
                onChange={getUpdateHandler('endOffset3')} size="6"/>
            aminoacids
          </div>
        </div>
      );
    default:
      return ( <noscript/> );
  }
}

let FastaReporterForm = React.createClass({

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

  // this form does not submit to the answer service; SRT processing is done by a CGI script
  submitForm() {
    FormSubmitter.submitAsForm({
      method: 'post',
      target: '_blank',
      action: 'http://plasmodb.org/cgi-bin/geneSrt',
      inputs: this.props.formState
    })
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
            onChange={this.getUpdateHandler('attachmentType')} items={attachmentTypes}/>
        </div>
        <div style={{margin:'0.8em'}}>
          <input type="button" value="Get Sequences" onClick={this.submitForm}/>
        </div>
        <div>
          <hr/>
          <b>Note:</b><br/>
          For "genomic" sequence: If UTRs have not been annotated for a gene, then choosing
          "transcription start" may have the same effect as choosing "translation start".<br/>
          For "protein" sequence: you can only retrieve sequence contained within the ID(s)
          listed. i.e. from downstream of amino acid sequence start (ie. Methionine = 0) to
          upstream of the amino acid end (last amino acid in the protein = 0).<br/>
          <hr/>
        </div>
        <SrtHelp/>
      </div>
    );
  }

});

export default FastaReporterForm;
