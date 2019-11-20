import React from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import WdkServiceJsonReporterForm from 'wdk-client/Views/ReporterForm/WdkServiceJsonReporterForm';

let DownloadForm = props => ( <WdkServiceJsonReporterForm {...props}/> );

export default wrappable(DownloadForm);
