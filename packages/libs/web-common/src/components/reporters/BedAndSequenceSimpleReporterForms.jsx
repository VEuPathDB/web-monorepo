import React from 'react';
import createSequenceForm from './SequenceFormFactory';

const formBeforeCommonOptions = (props) => {
  return <React.Fragment></React.Fragment>;
};
const formAfterSubmitButton = (props) => {
  return <React.Fragment></React.Fragment>;
};
const getFormInitialState = () => ({});

let SequenceSimpleReporterForm = createSequenceForm(
  formBeforeCommonOptions,
  formAfterSubmitButton,
  getFormInitialState,
  'Sequences'
);
let BedSimpleReporterForm = createSequenceForm(
  formBeforeCommonOptions,
  formAfterSubmitButton,
  getFormInitialState,
  'Coordinates'
);
export { SequenceSimpleReporterForm, BedSimpleReporterForm };
