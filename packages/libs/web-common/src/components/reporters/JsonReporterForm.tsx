import React from 'react';
import SharedReporterForm from './SharedReporterForm';
import { ReporterFormComponent } from './Types';

const JsonReporterForm: ReporterFormComponent = (props) => (
  <SharedReporterForm {...props} />
);

JsonReporterForm.getInitialState = SharedReporterForm.getInitialState;

export default JsonReporterForm;
