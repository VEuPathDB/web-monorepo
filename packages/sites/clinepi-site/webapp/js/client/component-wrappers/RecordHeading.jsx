import React from 'react';
import StudyRecordHeading from './StudyRecordHeading';

export default RecordHeading => props => (
  props.recordClass.urlSegment === 'dataset'
    ? <StudyRecordHeading {...props} DefaultComponent={RecordHeading} />
    : <RecordHeading {...props} />
)
