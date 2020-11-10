import React from 'react';
import { TextBox, RadioList, SingleSelect } from 'wdk-client/Components';
import * as ComponentUtils from 'wdk-client/Utils/ComponentUtils';
import * as ReporterUtils from 'wdk-client/Views/ReporterForm/reporterUtils';
import SrtHelp from '../SrtHelp';

let util = Object.assign({}, ComponentUtils, ReporterUtils);

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

let FastaOrfReporterForm = props => {

  let { formState, updateFormState, onSubmit, includeSubmit } = props;
  let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, updateFormState, formState);

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
      { includeSubmit &&
        <div style={{margin:'0.8em'}}>
          <button className="btn" type="submit" onClick={onSubmit}>Get Sequences</button>
        </div>
      }
      <SrtHelp/>
    </div>
  );
};

FastaOrfReporterForm.getInitialState = () => ({
  formState: {
    attachmentType: 'plain',
    type: 'genomic',

    // sequence region inputs for 'genomic'
    upstreamAnchor: 'Start',
    upstreamSign: 'plus',
    upstreamOffset: 0,
    downstreamAnchor: 'End',
    downstreamSign: 'plus',
    downstreamOffset: 0
  },
  formUiState: {}
});

export default FastaOrfReporterForm;
