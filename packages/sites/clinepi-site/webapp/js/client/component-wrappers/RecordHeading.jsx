import React from 'react';
import StudyRecordHeading from 'ebrc-client/component-wrappers/StudyRecordHeading';

export default RecordHeading => props => (
  props.recordClass.urlSegment === 'dataset'
    ? <StudyRecordHeading {...props} DefaultComponent={RecordHeading} showSearches showDownload />
    : <RecordHeading {...props} />
)
