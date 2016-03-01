import React from 'react';
import * as Wdk from 'wdk-client';
import SrtHelp from '../common/SrtHelp';

let util = Object.assign({}, Wdk.ComponentUtils, Wdk.ReporterUtils);
let { RadioList, SingleSelect, TextBox } = Wdk.Components;

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

let ProteinRegionRange = props => {
  let { label, anchor, offset, formState, getUpdateHandler } = props;
  return (
    <div>
      <span>{label}</span>
      <SingleSelect name={anchor} value={formState[anchor]}
          onChange={getUpdateHandler(anchor)} items={proteinAnchorValues}/>
      <TextBox name={offset} value={formState[offset]}
          onChange={getUpdateHandler(offset)} size="6"/>
      aminoacids
    </div>
  );
};

let SequenceRegionInputs = props => {
  let { formState, getUpdateHandler } = props;
  switch (formState.type) {
    case 'genomic':
      return (
        <div>
          <hr/>
          <h3>Choose the region of the sequence(s):</h3>
          <SequenceRegionRange label="Begin at" anchor="upstreamAnchor" sign="upstreamSign"
            offset="upstreamOffset" formState={formState} getUpdateHandler={getUpdateHandler}/>
          <SequenceRegionRange label="End at" anchor="downstreamAnchor" sign="downstreamSign"
            offset="downstreamOffset" formState={formState} getUpdateHandler={getUpdateHandler}/>
        </div>
      );
    case 'protein':
      return (
        <div>
          <hr/>
          <h3>Choose the region of the protein sequence(s):</h3>
          <ProteinRegionRange label="Begin at" anchor="startAnchor3" offset="startOffset3"
            formState={formState} getUpdateHandler={getUpdateHandler}/>
          <ProteinRegionRange label="End at" anchor="endAnchor3" offset="endOffset3"
            formState={formState} getUpdateHandler={getUpdateHandler}/>
        </div>
      );
    default:
      return ( <noscript/> );
  }
};

let FastaGeneReporterForm = props => {
  let { formState, onFormChange, onSubmit } = props;
  let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, onFormChange, formState);
  return (
    <div>
      <h3>Choose the type of sequence:</h3>
      <div style={{marginLeft:"2em"}}>
        <RadioList name="type" value={formState.type}
            onChange={getUpdateHandler('type')} items={sequenceTypes}/>
      </div>
      <SequenceRegionInputs formState={formState} getUpdateHandler={getUpdateHandler}/>
      <hr/>
      <h3>Download Type:</h3>
      <div style={{marginLeft:"2em"}}>
        <RadioList name="attachmentType" value={formState.attachmentType}
          onChange={getUpdateHandler('attachmentType')} items={util.attachmentTypes}/>
      </div>
      <div style={{margin:'0.8em'}}>
        <input type="button" value="Get Sequences" onClick={onSubmit}/>
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
};

FastaGeneReporterForm.getInitialState = () => ({
  formState: {
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
  },
  formUiState: {}
});

export default FastaGeneReporterForm;
