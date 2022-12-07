import React from 'react';
import createBedForm from './BedFormFactory';

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

export default createBedForm(formBeforeCommonOptions, formAfterSubmitButton, getFormInitialState);
