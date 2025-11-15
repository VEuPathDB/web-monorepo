import React from 'react';
import createSequenceForm from './SequenceFormFactory';

const formBeforeCommonOptions = () => {
  return <React.Fragment></React.Fragment>;
};
const formAfterSubmitButton = () => {
  return <React.Fragment></React.Fragment>;
};
const getFormInitialState = () => ({});

const SequenceSimpleReporterForm = createSequenceForm(
  formBeforeCommonOptions,
  formAfterSubmitButton,
  getFormInitialState,
  'Sequences'
);
const BedSimpleReporterForm = createSequenceForm(
  formBeforeCommonOptions,
  formAfterSubmitButton,
  getFormInitialState,
  'Coordinates'
);
export { SequenceSimpleReporterForm, BedSimpleReporterForm };
