import React from 'react';
import { RadioList, CheckboxList, SingleSelect, TextBox, Checkbox } from '@veupathdb/wdk-client/lib/Components';
import { deflineFieldOptions, GenomicSequenceRegionInputs, ProteinSequenceRegionInputs, FeaturesList, ComponentsList } from './BedFormElements';
import * as ComponentUtils from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import * as ReporterUtils from '@veupathdb/wdk-client/lib/Views/ReporterForm/reporterUtils';
import SrtHelp from '../SrtHelp';

let util = Object.assign({}, ComponentUtils, ReporterUtils);


let splicedGenomicOptions = [
  { value: 'cds', display: 'CDS'},
  { value: 'transcript', display: 'Transcript'},
];

let proteinFeatureOptions = [
  { value: 'interpro', display: 'InterPro' },
  { value: 'signalp', display: 'SignalP' },
  { value: 'tmhmm', display: 'Transmembrane Domains' },
  { value: 'low_complexity', display: 'Low Complexity Regions' }
];

let geneComponentOptions = [
  { value: 'five_prime_utr', display: '5\' UTR' },
  { value: 'three_prime_utr', display: '3\' UTR' },
  { value: 'exon', display: 'exon' },
  { value: 'intron', display: 'intron' },
];


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
            { value: 'genomic', display: 'Unspliced Genomic Sequence', body:  (
              <GenomicSequenceRegionInputs formState={formState} getUpdateHandler={getUpdateHandler}/>
            )},
            { value: 'protein', display: 'Protein Sequence', body: (
              <ProteinSequenceRegionInputs formState={formState} getUpdateHandler={getUpdateHandler}/>
            )},
            { value: 'protein_features', display: 'Protein Features', body: (
              <FeaturesList field="proteinFeature" features={proteinFeatureOptions} formState={formState} getUpdateHandler={getUpdateHandler} />
            )},
            { value: 'spliced_genomic', display: 'Spliced Genomic Sequence', body: (
              <FeaturesList field="splicedGenomic" features={splicedGenomicOptions} formState={formState} getUpdateHandler={getUpdateHandler} />
            )},
            { value: 'gene_components', display: 'Gene Components', body: (
              <ComponentsList field="geneComponents" features={geneComponentOptions} formState={formState} getUpdateHandler={getUpdateHandler} />
            )},
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
          onChange={getUpdateHandler('deflineType')} items={[
            {  value: "short", display: 'ID Only' },
            { 
              value: "full", display: 'Full Fasta Header',
              body: (<ComponentsList field="deflineFields" features={deflineFieldOptions} formState={formState} getUpdateHandler={getUpdateHandler} />),
            }
            ]}/>
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
    deflineType: "short",
    deflineFields: deflineFieldOptions.map((x) => x.value),

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
    geneComponents: geneComponentOptions.map((x) => x.value),
    proteinFeature: proteinFeatureOptions[0].value,
    splicedGenomic: splicedGenomicOptions[0].value,
  },
  formUiState: {}
});

export default FastaGeneReporterForm;
