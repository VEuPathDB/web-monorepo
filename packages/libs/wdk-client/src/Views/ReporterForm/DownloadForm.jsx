import React from 'react';
import { wrappable } from '../../Utils/ComponentUtils';
import WdkServiceJsonReporterForm from '../../Views/ReporterForm/WdkServiceJsonReporterForm';

let DownloadForm = (props) => <WdkServiceJsonReporterForm {...props} />;

export default wrappable(DownloadForm);
