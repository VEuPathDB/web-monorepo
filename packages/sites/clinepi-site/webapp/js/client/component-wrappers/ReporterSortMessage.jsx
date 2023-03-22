import React from 'react';
import ClinEpiReporterMessage from './ClinEpiReporterMessage';

export default ReporterSortMessage => props => {
    return <ClinEpiReporterMessage {...props} DefaultComponent={ReporterSortMessage} />;
}
