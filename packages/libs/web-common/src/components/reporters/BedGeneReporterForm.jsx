import React from 'react';
import {
  RadioList,
  SingleSelect,
  NumberSelector,
} from '@veupathdb/wdk-client/lib/Components';
import { FeaturesList } from './SequenceFormElements';
import * as ComponentUtils from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import * as ReporterUtils from '@veupathdb/wdk-client/lib/Views/ReporterForm/reporterUtils';
import SrtHelp from '../SrtHelp';
import createSequenceForm from './SequenceFormFactory';

/*
 * Adapted from SequenceGeneReporterForm
 * (no protein options)
 */
const util = Object.assign({}, ComponentUtils, ReporterUtils);

const splicedGenomicOptions = [
  { value: 'cds', display: 'Coding Sequence' },
  { value: 'transcript', display: 'Transcript' },
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

const signs = [
  { value: 'plus', display: '+' },
  { value: 'minus', display: '-' },
];

const formSequenceTypeOptions = [
  { value: 'genomic', display: 'Unspliced Genomic Region' },
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
        size={6}
      />
      nucleotides
    </React.Fragment>
  );
};

const GenomicSequenceRegionInputs = (props) => {
  const { formState, getUpdateHandler } = props;
  return (
    <div>
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
        <hr />
      </div>
      <SrtHelp />
    </React.Fragment>
  );
};
const getFormInitialState = () => ({
  type: 'genomic',

  reverseAndComplement: false,
  upstreamAnchor: genomicAnchorValues[0].value,
  upstreamSign: signs[0].value,
  upstreamOffset: 0,
  downstreamAnchor: genomicAnchorValues[3].value,
  downstreamSign: signs[0].value,
  downstreamOffset: 0,

  dnaComponent: dnaComponentOptions[0].value,
  transcriptComponent: transcriptComponentOptions[0].value,
  splicedGenomic: splicedGenomicOptions[0].value,
});

export default createSequenceForm(
  formBeforeCommonOptions,
  formAfterSubmitButton,
  getFormInitialState,
  'Coordinates'
);
