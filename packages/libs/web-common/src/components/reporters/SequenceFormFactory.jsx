import React, { useCallback, useState } from 'react';
import {
  RadioList,
  NumberSelector,
  Checkbox,
  Loading,
} from '@veupathdb/wdk-client/lib/Components';
import { ComponentsList } from './SequenceFormElements';
import * as ComponentUtils from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import * as ReporterUtils from '@veupathdb/wdk-client/lib/Views/ReporterForm/reporterUtils';
import './ReporterForms.scss';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { getResultTypeDetails } from '@veupathdb/wdk-client/lib/Utils/WdkResult';

const SINGLE_TRANSCRIPT_VIEW_FILTER_VALUE = {
  name: 'representativeTranscriptOnly',
  value: {},
};

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
        <div className="ebrc-FixedWidth-detail">
          <NumberSelector
            name={'basesPerLine'}
            start={0}
            end={10000}
            value={formState['basesPerLine']}
            step={1}
            onChange={getUpdateHandler('basesPerLine')}
            size={6}
          />
          <span>bases per line</span>
        </div>
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
    const {
      formState,
      updateFormState,
      onSubmit,
      includeSubmit,
      viewFilters,
      updateViewFilters,
      resultType,
    } = props;
    const resultTypeDetails = useWdkService(
      (wdkService) => getResultTypeDetails(wdkService, resultType),
      [resultType]
    );
    const shouldRenderTranscriptFilter =
      resultTypeDetails?.recordClassName === 'transcript';
    const getUpdateHandler = (fieldName) =>
      util.getChangeHandler(fieldName, updateFormState, formState);
    const transcriptPerGeneChangeHandler = (isChecked) => {
      const nextViewFilters =
        viewFilters?.filter(
          (filterValue) =>
            filterValue.name !== SINGLE_TRANSCRIPT_VIEW_FILTER_VALUE.name
        ) ?? [];
      if (isChecked) {
        nextViewFilters.push(SINGLE_TRANSCRIPT_VIEW_FILTER_VALUE);
      }
      updateViewFilters(nextViewFilters);
    };

    const [submitInProgress, setSubmitInProgress] = useState(false);

    const submitHandler = useCallback(
      async (...args) => {
        try {
          setSubmitInProgress(true);
          await onSubmit(...args);
        } finally {
          setSubmitInProgress(false);
        }
      },
      [onSubmit]
    );

    return (
      <div>
        {formBeforeCommonOptions(props)}
        <h3>Download type:</h3>
        <div style={{ marginLeft: '2em' }}>
          <RadioList
            name="attachmentType"
            value={formState.attachmentType}
            onChange={getUpdateHandler('attachmentType')}
            items={util.attachmentTypes}
          />
        </div>
        {reportType === 'Sequences' && sequenceOptions(props)}
        {shouldRenderTranscriptFilter && (
          <>
            <h3>Additional options:</h3>
            <div style={{ marginLeft: '1.5em' }}>
              <label>
                <Checkbox
                  value={
                    viewFilters?.some(
                      (f) => f.name === SINGLE_TRANSCRIPT_VIEW_FILTER_VALUE.name
                    ) ?? false
                  }
                  onChange={transcriptPerGeneChangeHandler}
                />
                <span style={{ marginLeft: '0.5em' }}>
                  Include only one transcript per gene (the longest)
                </span>
              </label>
            </div>
          </>
        )}
        {includeSubmit && (
          <div style={{ margin: '0.8em' }}>
            <button
              className="btn"
              type="submit"
              onClick={submitHandler}
              disabled={submitInProgress}
            >
              {submitInProgress ? 'Loading...' : <>Get {reportType}</>}
            </button>
          </div>
        )}
        {formAfterSubmitButton(props)}
      </div>
    );
  };

  Form.getInitialState = () => {
    return {
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
    };
  };
  return Form;
};
export default createSequenceForm;
