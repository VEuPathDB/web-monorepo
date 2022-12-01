import React from 'react';
import { RadioList, CheckboxList, SingleSelect, TextBox, Checkbox } from '@veupathdb/wdk-client/lib/Components';

let deflineFieldOptions = [
  { value: 'organism', display: 'Organism' },
  { value: 'description', display: 'Description' },
  { value: 'position', display: 'Location' },
  { value: 'ui_choice', display: 'Input Parameters' },
  { value: 'segment_length', display: 'Segment Length' },
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

// RadioList -> multiple choice
let ComponentsList = props => {
  let { features, field, formState, getUpdateHandler} = props;
  return (
    <div>
      <div
        style={{
          marginLeft: '0.75em'
        }}>
        <CheckboxList name={field} value={formState[field]} onChange={getUpdateHandler(field)} items={features} linksPosition={null}/>
      </div>
    </div>
  );
}
export {GenomicSequenceRegionInputs, ProteinSequenceRegionInputs, FeaturesList, ComponentsList, deflineFieldOptions};
