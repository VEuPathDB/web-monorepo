import React from 'react';

import { withPermissions } from 'ebrc-client/components/Permissions';
import StudyRecordHeading from 'ebrc-client/component-wrappers/StudyRecordHeading';

const ClinEpiStudyRecordHeading = withPermissions(StudyRecordHeading);

export default RecordHeading => props => (
  props.recordClass.urlSegment === 'dataset'
    ? <ClinEpiStudyRecordHeading {...props} DefaultComponent={RecordHeading} showSearches showDownload />
    : <RecordHeading {...props} />
)
