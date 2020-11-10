import React from 'react';
import SharedReporterForm from './SharedReporterForm';

let TextReporterForm = props => ( <SharedReporterForm {...props}/> );

TextReporterForm.getInitialState = SharedReporterForm.getInitialState;

export default TextReporterForm;
