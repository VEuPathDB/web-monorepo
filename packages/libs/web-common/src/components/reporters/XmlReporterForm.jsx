import React from 'react';
import SharedReporterForm from './SharedReporterForm';

/** @type import('./Types').ReporterFormComponent */
let XmlReporterForm = (props) => <SharedReporterForm {...props} />;

XmlReporterForm.getInitialState = SharedReporterForm.getInitialState;

export default XmlReporterForm;
