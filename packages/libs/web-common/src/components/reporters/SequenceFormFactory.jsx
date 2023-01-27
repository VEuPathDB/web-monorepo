import React from 'react';
import { RadioList, CheckboxList, SingleSelect, TextBox, Checkbox, NumberSelector } from '@veupathdb/wdk-client/lib/Components';
import { FeaturesList, ComponentsList } from './SequenceFormElements';
import * as ComponentUtils from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import * as ReporterUtils from '@veupathdb/wdk-client/lib/Views/ReporterForm/reporterUtils';

let util = Object.assign({}, ComponentUtils, ReporterUtils);

let deflineFieldOptions = [
  { value: 'organism', display: 'Organism' },
  { value: 'description', display: 'Description' },
  { value: 'position', display: 'Location' },
  { value: 'ui_choice', display: 'Input Parameters' },
  { value: 'segment_length', display: 'Segment Length' },
];

let sequenceOptions = (props) => {
  let { formState, updateFormState, onSubmit, includeSubmit } = props;
  let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, updateFormState, formState);
  return (
    <React.Fragment>
      <h3>Fasta defline:</h3>
      <div style={{marginLeft:"2em"}}>
        <RadioList name="deflineType" value={formState.deflineType}
          onChange={getUpdateHandler('deflineType')} items={[
            { value: "short", display: 'ID Only' },
            { value: "full", display: 'Full Fasta Header' },
          ]}
        />
        { formState.deflineType === 'short' ? null :
          <ComponentsList field="deflineFields" features={deflineFieldOptions} formState={formState} getUpdateHandler={getUpdateHandler} /> }
      </div>
      <h3>Sequence format:</h3>
      <div style={{marginLeft:"2em"}}>
        <RadioList name="sequenceFormat" value={formState.sequenceFormat}
          onChange={getUpdateHandler('sequenceFormat')} items={[
            { value: "single_line", display: 'Single Line' },
            { value: "fixed_width", display: 'Fixed Width' },
          ]
        }/>
        { formState.sequenceFormat === 'single_line' ? null :
          <React.Fragment>
            <span>Bases Per Line: </span>
            <NumberSelector name={"basesPerLine"} start={0} end={10000} value={formState["basesPerLine"]} step={1}
              onChange={getUpdateHandler("basesPerLine")} size="6"/>
          </React.Fragment> }
      </div>
    </React.Fragment>
  );
};

let createSequenceForm = (formBeforeCommonOptions, formAfterSubmitButton, getFormInitialState, reportType) => {
  let Form = (props) => {
    let { formState, updateFormState, onSubmit, includeSubmit } = props;
    let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, updateFormState, formState);
    return (
      <div>
        {formBeforeCommonOptions(props)}
        <h3>Download Type:</h3>
        <div style={{marginLeft:"2em"}}>
          <RadioList name="attachmentType" value={formState.attachmentType}
            onChange={getUpdateHandler('attachmentType')} items={util.attachmentTypes}/>
        </div>
        { reportType === "Sequences" && sequenceOptions(props) }
        { includeSubmit &&
          <div style={{margin:'0.8em'}}>
            <button className="btn" type="submit" onClick={onSubmit}>Get {reportType}</button>
          </div>
        }
        {formAfterSubmitButton(props)}
      </div>
    );
  };

  Form.getInitialState = () => ({
    formState: {
      attachmentType: 'plain',
      deflineType: "short",
      deflineFields: deflineFieldOptions.map((x) => x.value),
      sequenceFormat: "fixed_width",
      basesPerLine: 60,
      ...getFormInitialState()
    },
    formUiState: {}
  });
  return Form;
}
export default createSequenceForm;
