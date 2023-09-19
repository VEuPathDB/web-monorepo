import React from 'react';
import {
  RadioList,
  CheckboxList,
  SingleSelect,
  TextBox,
  Checkbox,
  NumberSelector,
} from '@veupathdb/wdk-client/lib/Components';
import { FeaturesList } from './SequenceFormElements';
import * as ComponentUtils from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import * as ReporterUtils from '@veupathdb/wdk-client/lib/Views/ReporterForm/reporterUtils';
import SrtHelp from '../SrtHelp';
import createSequenceForm from './SequenceFormFactory';

/*
 * Similar to SequenceGeneReporterForm
 * (but with protein options)
 */
const util = Object.assign({}, ComponentUtils, ReporterUtils);

const splicedGenomicOptions = [
  { value: 'cds', display: 'Coding Sequence' },
  { value: 'transcript', display: 'Transcript' },
];

const proteinFeatureOptions = [
  { value: 'interpro', display: 'InterPro' },
  { value: 'signalp', display: 'SignalP' },
  { value: 'tmhmm', display: 'Transmembrane Domains' },
  { value: 'low_complexity', display: 'Low Complexity Regions' },
];

const dnaComponentOptions = [
  { value: 'exon', display: 'Exon' },
  { value: 'intron', display: 'Intron' },
];

const transcriptComponentOptions = [
  { value: 'five_prime_utr', display: "5' UTR" },
  { value: 'cds', display: 'CDS' },
  { value: 'three_prime_utr', display: "3' UTR" },
];

const genomicAnchorValues = [
  { value: 'Start', display: 'Transcription Start***' },
  { value: 'CodeStart', display: 'Translation Start (ATG)' },
  { value: 'CodeEnd', display: 'Translation Stop Codon' },
  { value: 'End', display: 'Transcription Stop***' },
];

const proteinAnchorValues = [
  { value: 'DownstreamFromStart', display: 'Downstream from Start' },
  { value: 'UpstreamFromEnd', display: 'Upstream from End' },
];

const signs = [
  { value: 'plus', display: '+' },
  { value: 'minus', display: '-' },
];

const formSequenceTypeOptions = [
  { value: 'genomic', display: 'Unspliced Genomic Sequence' },
  {
    value: 'spliced_genomic',
    display: (
      <>
        Spliced Genomic Region (<i>i.e. transcribed sequences</i>)
      </>
    ),
  },
  { value: 'dna_component', display: 'DNA Component' },
  { value: 'transcript_component', display: 'Transcript Component' },
  { value: 'protein', display: 'Protein Sequence' },
  { value: 'protein_features', display: 'Protein Features' },
];

const SequenceRegionRange = (props) => {
  const { label, anchor, sign, offset, formState, getUpdateHandler } = props;
  return (
    <React.Fragment>
      <span>{label}</span>
      <SingleSelect
        name={anchor}
        value={formState[anchor]}
        onChange={getUpdateHandler(anchor)}
        items={genomicAnchorValues}
      />
      <SingleSelect
        name={sign}
        value={formState[sign]}
        onChange={getUpdateHandler(sign)}
        items={signs}
      />
      <NumberSelector
        name={offset}
        value={formState[offset]}
        start={0}
        end={10000}
        step={1}
        onChange={getUpdateHandler(offset)}
        size="6"
      />
      nucleotides
    </React.Fragment>
  );
};

const ProteinRegionRange = (props) => {
  const { label, anchor, offset, formState, getUpdateHandler } = props;
  return (
    <React.Fragment>
      <span>{label}</span>
      <SingleSelect
        name={anchor}
        value={formState[anchor]}
        onChange={getUpdateHandler(anchor)}
        items={proteinAnchorValues}
      />
      <NumberSelector
        name={offset}
        value={formState[offset]}
        start={0}
        end={10000}
        step={1}
        onChange={getUpdateHandler(offset)}
        size="6"
      />
      amino acids
    </React.Fragment>
  );
};

const GenomicSequenceRegionInputs = (props) => {
  const { formState, getUpdateHandler } = props;
  return (
    <div>
      <div style={{ marginLeft: '0.75em' }}>
        <Checkbox
          name="reverseAndComplement"
          value={formState.reverseAndComplement}
          onChange={getUpdateHandler('reverseAndComplement')}
        />{' '}
        Reverse & Complement
      </div>
      <div
        style={{
          display: 'inline-grid',
          gridTemplateColumns: 'repeat(5, auto)',
          alignItems: 'center',
          gridRowGap: '0.25em',
          gridColumnGap: '0.5em',
          marginLeft: '0.75em',
        }}
      >
        <SequenceRegionRange
          label="Begin at"
          anchor="upstreamAnchor"
          sign="upstreamSign"
          offset="upstreamOffset"
          formState={formState}
          getUpdateHandler={getUpdateHandler}
        />
        <SequenceRegionRange
          label="End at"
          anchor="downstreamAnchor"
          sign="downstreamSign"
          offset="downstreamOffset"
          formState={formState}
          getUpdateHandler={getUpdateHandler}
        />
      </div>
    </div>
  );
};
const ProteinSequenceRegionInputs = (props) => {
  const { formState, getUpdateHandler } = props;
  return (
    <div>
      <div
        style={{
          display: 'inline-grid',
          gridTemplateColumns: 'repeat(4, auto)',
          alignItems: 'center',
          gridRowGap: '0.25em',
          gridColumnGap: '0.5em',
          marginLeft: '0.75em',
        }}
      >
        <ProteinRegionRange
          label="Begin at"
          anchor="startAnchor3"
          offset="startOffset3"
          formState={formState}
          getUpdateHandler={getUpdateHandler}
        />
        <ProteinRegionRange
          label="End at"
          anchor="endAnchor3"
          offset="endOffset3"
          formState={formState}
          getUpdateHandler={getUpdateHandler}
        />
      </div>
    </div>
  );
};

/** @type import('./Types').ReporterFormComponent */
const formBeforeCommonOptions = (props) => {
  const { formState, updateFormState, onSubmit, includeSubmit } = props;
  const getUpdateHandler = (fieldName) =>
    util.getChangeHandler(fieldName, updateFormState, formState);
  const typeUpdateHandler = function (newTypeValue) {
    updateFormState(Object.assign({}, formState, { type: newTypeValue }));
  };
  const getTypeSpecificParams = () => {
    switch (formState.type) {
      case 'genomic':
        return (
          <GenomicSequenceRegionInputs
            formState={formState}
            getUpdateHandler={getUpdateHandler}
          />
        );
      case 'spliced_genomic':
        return (
          <FeaturesList
            field="splicedGenomic"
            features={splicedGenomicOptions}
            formState={formState}
            getUpdateHandler={getUpdateHandler}
          />
        );
      case 'dna_component':
        return (
          <FeaturesList
            field="dnaComponent"
            features={dnaComponentOptions}
            formState={formState}
            getUpdateHandler={getUpdateHandler}
          />
        );
      case 'transcript_component':
        return (
          <FeaturesList
            field="transcriptComponent"
            features={transcriptComponentOptions}
            formState={formState}
            getUpdateHandler={getUpdateHandler}
          />
        );
      case 'protein':
        return (
          <ProteinSequenceRegionInputs
            formState={formState}
            getUpdateHandler={getUpdateHandler}
          />
        );
      case 'protein_features':
        return (
          <FeaturesList
            field="proteinFeature"
            features={proteinFeatureOptions}
            formState={formState}
            getUpdateHandler={getUpdateHandler}
          />
        );
    }
  };
  return (
    <React.Fragment>
      <h3>Choose the type of sequence:</h3>
      <div style={{ marginLeft: '2em' }}>
        <RadioList
          name="type"
          value={formState.type}
          onChange={typeUpdateHandler}
          items={formSequenceTypeOptions}
        />
        <h4>
          Configure details for{' '}
          {
            formSequenceTypeOptions.find(
              (item) => item.value === formState.type
            ).display
          }
          :
        </h4>
        {getTypeSpecificParams()}
      </div>
    </React.Fragment>
  );
};
const formAfterSubmitButton = (props) => {
  return (
    <React.Fragment>
      <div>
        <hr />
        <b>Note:</b>
        <br />
        For "genomic" sequence: If UTRs have not been annotated for a gene, then
        choosing "transcription start" may have the same effect as choosing
        "translation start".
        <br />
        For "protein" sequence: you can only retrieve sequence contained within
        the ID(s) listed. i.e. from downstream of amino acid sequence start (ie.
        Methionine = 0) to upstream of the amino acid end (last amino acid in
        the protein = 0).
        <br />
        <hr />
      </div>
      <SrtHelp />
    </React.Fragment>
  );
};
const getFormInitialState = () => ({
  type: 'genomic',

  // sequence region inputs for 'genomic'
  reverseAndComplement: false,
  upstreamAnchor: genomicAnchorValues[0].value,
  upstreamSign: signs[0].value,
  upstreamOffset: 0,
  downstreamAnchor: genomicAnchorValues[3].value,
  downstreamSign: signs[0].value,
  downstreamOffset: 0,

  // sequence region inputs for 'protein'
  startAnchor3: proteinAnchorValues[0].value,
  startOffset3: 0,
  endAnchor3: proteinAnchorValues[1].value,
  endOffset3: 0,

  dnaComponent: dnaComponentOptions[0].value,
  transcriptComponent: transcriptComponentOptions[0].value,
  proteinFeature: proteinFeatureOptions[0].value,
  splicedGenomic: splicedGenomicOptions[0].value,
});

export default createSequenceForm(
  formBeforeCommonOptions,
  formAfterSubmitButton,
  getFormInitialState,
  'Sequences'
);
