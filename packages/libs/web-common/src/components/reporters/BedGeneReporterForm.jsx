import React from 'react';
import { RadioList, CheckboxList, SingleSelect, TextBox, Checkbox, NumberSelector } from '@veupathdb/wdk-client/lib/Components';
import { FeaturesList, ComponentsList } from './SequenceFormElements';
import * as ComponentUtils from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import * as ReporterUtils from '@veupathdb/wdk-client/lib/Views/ReporterForm/reporterUtils';
import SrtHelp from '../SrtHelp';
import createSequenceForm from './SequenceFormFactory';

/*
 * Adapted from SequenceGeneReporterForm
 * (no protein options)
 */
let util = Object.assign({}, ComponentUtils, ReporterUtils);

let splicedGenomicOptions = [
  { value: 'cds', display: 'CDS'},
  { value: 'transcript', display: 'Transcript'},
];

let geneComponentOptions = [
  { value: 'five_prime_utr', display: '5\' UTR' },
  { value: 'three_prime_utr', display: '3\' UTR' },
  { value: 'exon', display: 'Exon' },
  { value: 'cds', display: 'CDS' },
  { value: 'intron', display: 'Intron' },
];

let genomicAnchorValues = [
  { value: 'Start', display: 'Transcription Start***' },
  { value: 'CodeStart', display: 'Translation Start (ATG)' },
  { value: 'CodeEnd', display: 'Translation Stop Codon' },
  { value: 'End', display: 'Transcription Stop***' }
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
      <NumberSelector name={offset} value={formState[offset]}
          start={0} end={10000} step={1}
          onChange={getUpdateHandler(offset)} size="6"/>
      nucleotides
    </React.Fragment>
  );
};

let GenomicSequenceRegionInputs = props => {
  let { formState, getUpdateHandler } = props;
  return (
    <div>
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

/** @type import('./Types').ReporterFormComponent */
let formBeforeCommonOptions = props => {
  let { formState, updateFormState, onSubmit, includeSubmit } = props;
  let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, updateFormState, formState);
  let typeUpdateHandler = function(newTypeValue) {
    updateFormState(Object.assign({}, formState, { type: newTypeValue }));
  };
  let getTypeSpecificParams = () => {
    switch(formState.type) {
      case 'genomic':
        return <GenomicSequenceRegionInputs formState={formState} getUpdateHandler={getUpdateHandler}/>;
      case 'spliced_genomic':
        return <FeaturesList field="splicedGenomic" features={splicedGenomicOptions} formState={formState} getUpdateHandler={getUpdateHandler} />;
      case 'gene_components':
        return <ComponentsList field="geneComponents" features={geneComponentOptions} formState={formState} getUpdateHandler={getUpdateHandler} />;
    }
  };
  return (
    <React.Fragment>
      <h3>Choose the type of result:</h3>
      <div style={{marginLeft:"2em"}}>
        <RadioList name="type" value={formState.type}
          onChange={typeUpdateHandler} items={[
            { value: 'genomic', display: 'Unspliced Genomic Region' },
            { value: 'spliced_genomic', display: 'Spliced Genomic Region' },
            { value: 'gene_components', display: 'Gene Components' },
          ]}
        />
        <h4>Configure details:</h4>
        {getTypeSpecificParams()}
      </div>
    </React.Fragment>
  );
};
let formAfterSubmitButton = props => {
  return (
    <React.Fragment>
      <div>
        <hr/>
        <b>Note:</b><br/>
        For "genomic" sequence: If UTRs have not been annotated for a gene, then choosing
        "transcription start" may have the same effect as choosing "translation start".<br/>
        <hr/>
      </div>
      <SrtHelp/>
    </React.Fragment>
  );
};
let getFormInitialState = () => ({
  type: 'genomic',

  reverseAndComplement: false,
  upstreamAnchor: genomicAnchorValues[0].value,
  upstreamSign: signs[0].value,
  upstreamOffset: 0,
  downstreamAnchor: genomicAnchorValues[3].value,
  downstreamSign: signs[0].value,
  downstreamOffset: 0,

  geneComponents: geneComponentOptions.map((x) => x.value),
  splicedGenomic: splicedGenomicOptions[0].value,
});

export default createSequenceForm(formBeforeCommonOptions, formAfterSubmitButton, getFormInitialState, 'Coordinates');
