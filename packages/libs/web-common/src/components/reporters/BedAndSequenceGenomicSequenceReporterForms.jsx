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
  { value: 'low_complexity', display: 'Low Complexity Regions' },
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
    </React.Fragment>
  );
};
let getFormInitialState = () => ({
  strand: strands[0].value,
  sequenceFeature: sequenceFeatureOptions[0].value,
});
let SequenceGenomicSequenceReporterForm = createSequenceForm(formBeforeCommonOptions, formAfterSubmitButton, getFormInitialState, 'Sequences');
let BedGenomicSequenceReporterForm = createSequenceForm(formBeforeCommonOptions, formAfterSubmitButton, getFormInitialState, 'Coordinates');
export {SequenceGenomicSequenceReporterForm, BedGenomicSequenceReporterForm};



