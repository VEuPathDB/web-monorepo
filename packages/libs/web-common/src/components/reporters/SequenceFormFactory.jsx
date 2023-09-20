import React from 'react';
import {
  RadioList,
  NumberSelector,
} from '@veupathdb/wdk-client/lib/Components';
import { ComponentsList } from './SequenceFormElements';
import * as ComponentUtils from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import * as ReporterUtils from '@veupathdb/wdk-client/lib/Views/ReporterForm/reporterUtils';
import './ReporterForms.scss';

const util = Object.assign({}, ComponentUtils, ReporterUtils);

const deflineFieldOptions = [
  { value: 'gene_id', display: 'Gene ID', disabled: true },
  { value: 'organism', display: 'Organism' },
  { value: 'description', display: 'Description' },
  { value: 'position', display: 'Location' },
  { value: 'ui_choice', display: 'Input Parameters' },
  { value: 'segment_length', display: 'Segment Length' },
];

const sequenceOptions = (props) => {
  const { formState, updateFormState } = props;
  const getUpdateHandler = (fieldName) =>
    util.getChangeHandler(fieldName, updateFormState, formState);
  return (
    <React.Fragment>
      <h3>Fasta defline:</h3>
      <div>
        {formState.deflineType === 'full' && (
          <ComponentsList
            field="deflineFields"
            features={deflineFieldOptions}
            formState={formState}
            getUpdateHandler={getUpdateHandler}
          />
        )}
      </div>
      <h3>Sequence format:</h3>
      <div
        style={{
          marginLeft: '2em',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
        }}
      >
        <RadioList
          name="sequenceFormat"
          value={formState.sequenceFormat}
          onChange={getUpdateHandler('sequenceFormat')}
          items={[
            { value: 'fixed_width', display: 'Fixed Width with' },
            { value: 'single_line', display: 'Single Line' },
          ]}
        />
        {formState.sequenceFormat === 'fixed_width' && (
          <div className="ebrc-FixedWidth-detail">
            <NumberSelector
              name={'basesPerLine'}
              start={0}
              end={10000}
              value={formState['basesPerLine']}
              step={1}
              onChange={getUpdateHandler('basesPerLine')}
              size="6"
            />
            <span>bases per line</span>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

const createSequenceForm = (
  formBeforeCommonOptions,
  formAfterSubmitButton,
  getFormInitialState,
  reportType
) => {
  const Form = (props) => {
    const { formState, updateFormState, onSubmit, includeSubmit } = props;
    const getUpdateHandler = (fieldName) =>
      util.getChangeHandler(fieldName, updateFormState, formState);
    return (
      <div>
        {formBeforeCommonOptions(props)}
        <h3>Download Type:</h3>
        <div style={{ marginLeft: '2em' }}>
          <RadioList
            name="attachmentType"
            value={formState.attachmentType}
            onChange={getUpdateHandler('attachmentType')}
            items={util.attachmentTypes}
          />
        </div>
        {reportType === 'Sequences' && sequenceOptions(props)}
        {includeSubmit && (
          <div style={{ margin: '0.8em' }}>
            <button className="btn" type="submit" onClick={onSubmit}>
              Get {reportType}
            </button>
          </div>
        )}
        {formAfterSubmitButton(props)}
      </div>
    );
  };

  Form.getInitialState = () => ({
    formState: {
      attachmentType: 'plain',
      deflineType: 'full',
      // QUESTION: should I remove this from formState when form is submitted or should backend expect this field?
      deflineFields: ['gene_id'],
      sequenceFormat: 'fixed_width',
      basesPerLine: 60,
      ...getFormInitialState(),
    },
    formUiState: {},
  });
  return Form;
};
export default createSequenceForm;
