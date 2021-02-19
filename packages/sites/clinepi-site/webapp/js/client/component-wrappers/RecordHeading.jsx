import React from 'react';

import { withPermissions } from '@veupathdb/web-common/lib/components/Permissions';
import StudyRecordHeading from '@veupathdb/web-common/lib/component-wrappers/StudyRecordHeading';

const ClinEpiStudyRecordHeading = withPermissions(StudyRecordHeading);

export default RecordHeading => props => (
  props.recordClass.urlSegment === 'dataset'
    ? <ClinEpiStudyRecordHeading {...props} DefaultComponent={RecordHeading} showSearches showDownload />
    : <RecordHeading {...props} />
)
