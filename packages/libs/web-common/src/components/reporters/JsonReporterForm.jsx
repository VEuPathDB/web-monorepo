import React from 'react';
import SharedReporterForm from './SharedReporterForm';

/** @type import('./Types').ReporterFormComponent */
let JsonReporterForm = props => ( <SharedReporterForm {...props}/> );

JsonReporterForm.getInitialState = SharedReporterForm.getInitialState;

export default JsonReporterForm;
