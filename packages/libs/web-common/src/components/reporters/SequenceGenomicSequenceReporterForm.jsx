import React from 'react';
import { RadioList, Checkbox, TextBox } from '@veupathdb/wdk-client/lib/Components';
import { FeaturesList, ComponentsList } from './SequenceFormElements';
import * as ComponentUtils from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import * as ReporterUtils from '@veupathdb/wdk-client/lib/Views/ReporterForm/reporterUtils';
import createSequenceForm from './SequenceFormFactory';

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
const formBeforeCommonOptions = (props) => {
  let { formState, updateFormState, onSubmit, includeSubmit } = props;
  let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, updateFormState, formState);
  return (
    <React.Fragment>
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
    </React.Fragment>
  );
};

let formAfterSubmitButton = (props) => {
  return (
    <React.Fragment>
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
    </React.Fragment>
  );
};
let getFormInitialState = () => ({
  strand: strands[0].value,
  sequenceFeature: sequenceFeatureOptions[0].value,
});

export default createSequenceForm(formBeforeCommonOptions, formAfterSubmitButton, getFormInitialState);


