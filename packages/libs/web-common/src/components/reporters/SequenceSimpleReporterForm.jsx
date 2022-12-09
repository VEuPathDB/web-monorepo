import React from 'react';
import createSequenceForm from './SequenceFormFactory';

const formBeforeCommonOptions = (props) => {
  return (
    <React.Fragment>
    </React.Fragment>
  );
};
const formAfterSubmitButton = (props) => {
  return (
    <React.Fragment>
    </React.Fragment>
  );
};
const getFormInitialState = () => ({});

export default createSequenceForm(formBeforeCommonOptions, formAfterSubmitButton, getFormInitialState);
