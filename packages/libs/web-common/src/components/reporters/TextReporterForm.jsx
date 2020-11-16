import React from 'react';
import SharedReporterForm from './SharedReporterForm';

/** @type import('./Types').ReporterFormComponent */
let TextReporterForm = props => ( <SharedReporterForm {...props}/> );

TextReporterForm.getInitialState = SharedReporterForm.getInitialState;

export default TextReporterForm;
