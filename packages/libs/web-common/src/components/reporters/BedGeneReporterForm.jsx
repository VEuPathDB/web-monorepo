import React from 'react';
import { RadioList, SingleSelect, TextBox, Checkbox } from '@veupathdb/wdk-client/lib/Components';
import * as ComponentUtils from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import * as ReporterUtils from '@veupathdb/wdk-client/lib/Views/ReporterForm/reporterUtils';
import SrtHelp from '../SrtHelp';

let util = Object.assign({}, ComponentUtils, ReporterUtils);

let deflineTypes = [
  {  value: "short", display: 'ID Only' },
  {  value: "full", display: 'Full Fasta Header' }
];

let proteinFeatureOptions = [
  { value: 'interpro', display: 'InterPro' },
  { value: 'signalp', display: 'SignalP' },
  { value: 'tmhmm', display: 'Transmembrane Domains' },
  { value: 'low_complexity', display: 'Low Complexity Regions' }
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
    <React.Fragment>
      <span>{label}</span>
      <SingleSelect name={anchor} value={formState[anchor]}
          onChange={getUpdateHandler(anchor)} items={genomicAnchorValues}/>
      <SingleSelect name={sign} value={formState[sign]}
          onChange={getUpdateHandler(sign)} items={signs}/>
      <TextBox name={offset} value={formState[offset]}
          onChange={getUpdateHandler(offset)} size="6"/>
      nucleotides
    </React.Fragment>
  );
};

let ProteinRegionRange = props => {
  let { label, anchor, offset, formState, getUpdateHandler } = props;
  return (
    <React.Fragment>
      <span>{label}</span>
      <SingleSelect name={anchor} value={formState[anchor]}
          onChange={getUpdateHandler(anchor)} items={proteinAnchorValues}/>
      <TextBox name={offset} value={formState[offset]}
          onChange={getUpdateHandler(offset)} size="6"/>
      aminoacids
    </React.Fragment>
  );
};

let GenomicSequenceRegionInputs = props => {
  let { formState, getUpdateHandler } = props;
  return (
    <div>
      <div style={{marginLeft:"0.75em"}}>
        <Checkbox name="reverseAndComplement" value={formState.reverseAndComplement} onChange={getUpdateHandler('reverseAndComplement')}/> Reverse & Complement
      </div>
      <div
        style={{
          display: 'inline-grid',
          gridTemplateColumns: 'repeat(5, auto)',
          alignItems: 'center',
          gridRowGap: '0.25em',
          gridColumnGap: '0.5em',
          marginLeft: '0.75em'
        }}
      >
        <SequenceRegionRange label="Begin at" anchor="upstreamAnchor" sign="upstreamSign"
          offset="upstreamOffset" formState={formState} getUpdateHandler={getUpdateHandler}/>
        <SequenceRegionRange label="End at" anchor="downstreamAnchor" sign="downstreamSign"
          offset="downstreamOffset" formState={formState} getUpdateHandler={getUpdateHandler}/>
      </div>
    </div>
  );
}
let ProteinSequenceRegionInputs = props => {
  let { formState, getUpdateHandler } = props;
  return (
    <div>
      <div
        style={{
          display: 'inline-grid',
          gridTemplateColumns: 'repeat(4, auto)',
          alignItems: 'center',
          gridRowGap: '0.25em',
          gridColumnGap: '0.5em',
          marginLeft: '0.75em'
        }}
      >
        <ProteinRegionRange label="Begin at" anchor="startAnchor3" offset="startOffset3"
          formState={formState} getUpdateHandler={getUpdateHandler}/>
        <ProteinRegionRange label="End at" anchor="endAnchor3" offset="endOffset3"
          formState={formState} getUpdateHandler={getUpdateHandler}/>
      </div>
    </div>
  );
};

let FeaturesList = props => {
  let { features, field, formState, getUpdateHandler} = props;
  return (
    <div>
      <div
        style={{
          marginLeft: '0.75em'
        }}>
        <RadioList name={field} value={formState[field]} onChange={getUpdateHandler(field)} items={features}/>
      </div>
    </div>
  );
}

/** @type import('./Types').ReporterFormComponent */
let FastaGeneReporterForm = props => {
  let { formState, updateFormState, onSubmit, includeSubmit } = props;
  let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, updateFormState, formState);
  let typeUpdateHandler = function(newTypeValue) {
    updateFormState(Object.assign({}, formState, { type: newTypeValue }));
  };
  return (
    <div>
      <h3>Choose the type of result:</h3>
      <div style={{marginLeft:"2em"}}>
        <RadioList name="type" value={formState.type}
          onChange={typeUpdateHandler} items={
          [
            { value: 'genomic', display: 'Genomic Sequence', body:  (<GenomicSequenceRegionInputs formState={formState} getUpdateHandler={getUpdateHandler}/>)},
            { value: 'protein', display: 'Protein Sequence', body: (<ProteinSequenceRegionInputs formState={formState} getUpdateHandler={getUpdateHandler}/>)},
            { value: 'protein_features', display: 'Protein Features', body: (<FeaturesList field="proteinFeature" features={proteinFeatureOptions} formState={formState} getUpdateHandler={getUpdateHandler} />) },
            { value: 'cds', display: 'CDS'},
            { value: 'transcript', display: 'Transcript'},
          ]  
          
          }/>
      </div>
      <h3>Download Type:</h3>
      <div style={{marginLeft:"2em"}}>
        <RadioList name="attachmentType" value={formState.attachmentType}
          onChange={getUpdateHandler('attachmentType')} items={util.attachmentTypes}/>
      </div>
      <h3>Fasta defline:</h3>
      <div style={{marginLeft:"2em"}}>
        <RadioList name="deflineType" value={formState.deflineType}
          onChange={getUpdateHandler('deflineType')} items={deflineTypes}/>
      </div>
      { includeSubmit &&
        <div style={{margin:'0.8em'}}>
          <button className="btn" type="submit" onClick={onSubmit}>Get Sequences</button>
        </div>
      }

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
    reverseAndComplement: false,
    deflineType: deflineTypes[0].value,

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
    endOffset3: 0,

    proteinFeature: proteinFeatureOptions[0].value,
  },
  formUiState: {}
});

export default FastaGeneReporterForm;
