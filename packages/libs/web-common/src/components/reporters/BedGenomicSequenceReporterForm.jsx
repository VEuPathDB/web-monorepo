import React from 'react';
import { RadioList, Checkbox, TextBox } from '@veupathdb/wdk-client/lib/Components';
import { deflineFieldOptions, ComponentsList } from './BedFormElements';
import * as ComponentUtils from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import * as ReporterUtils from '@veupathdb/wdk-client/lib/Views/ReporterForm/reporterUtils';

let util = Object.assign({}, ComponentUtils, ReporterUtils);

let strands = [
  {  value: "forward", display: 'Forward' },
  {  value: "reverse", display: 'Reverse' }
];

let sequenceFeatureOptions = [
  { value: 'whole_sequence', display: 'Whole Sequence' },
  { value: 'low_complexity', display: 'Low Complexity' },
  { value: 'repeats', display: 'Repeats' },
  { value: 'tandem', display: 'Tandem Repeats' },
  { value: 'centromere', display: 'Centromere' }
];

/** @type import('./Types').ReporterFormComponent */
const BedGenomicSequenceReporterForm = props => {
  let { formState, updateFormState, onSubmit, includeSubmit } = props;
  let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, updateFormState, formState);
  return (
    <div>
      <h3>Type of result:</h3>
      <div style={{marginLeft: '2em'}}>
        <RadioList name={"sequenceFeature"} value={formState["sequenceFeature"]} items={sequenceFeatureOptions}
          onChange={getUpdateHandler("sequenceFeature")}/>
      </div>
      <h3>Strand:</h3>
      <div style={{marginLeft:"2em"}}>
        <RadioList name="strand" value={formState.strand} items={strands}
            onChange={getUpdateHandler('strand')}/>
      </div>
      <h3>Download Type:</h3>
      <div style={{marginLeft:"2em"}}>
        <RadioList name="attachmentType" value={formState.attachmentType} items={util.attachmentTypes}
            onChange={getUpdateHandler('attachmentType')}/>
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
        <h3>Options:</h3>
        <ul style={{marginBottom:"2em"}}>
          <li>
            <i><b>complete sequence</b></i> to retrieve the complete sequence
            for the requested genomic regions, use "Nucleotide positions 1 to 0"
          </li>
          <li>
            <i><b>specific sequence region</b></i> to retrieve a specific region
            for the requested genomic regions, use "Nucleotide positions
            <i>x</i> to <i>y</i>", where <i>y</i> is greater than <i>x</i>
          </li>
        </ul>
        <hr/>
      </div>
    </div>
  );
};

BedGenomicSequenceReporterForm.getInitialState = () => ({
  formState: {
    attachmentType: 'plain',
    strand: strands[0].value,
    deflineType: "short",
    deflineFields: deflineFieldOptions.map((x) => x.value),
    sequenceFeature: sequenceFeatureOptions[0]
  },
  formUiState: {}
});

export default BedGenomicSequenceReporterForm;



