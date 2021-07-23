import React from 'react';
import { useEda } from '@veupathdb/web-common/lib/config';

import { withPermissions } from '@veupathdb/web-common/lib/components/Permissions';
import StudyRecordHeading from '@veupathdb/web-common/lib/component-wrappers/StudyRecordHeading';
import { EdaRecordHeading } from '@veupathdb/web-common/lib/component-wrappers/EdaRecordHeading';

const ClinEpiStudyRecordHeading = withPermissions(StudyRecordHeading);
const ClinEpiEdaRecordHeading = withPermissions(EdaRecordHeading);

export default RecordHeading => props => (
  props.recordClass.urlSegment === 'dataset'
    ? useEda
      ? <ClinEpiEdaRecordHeading {...props} DefaultComponent={RecordHeading}/>
      : <ClinEpiStudyRecordHeading {...props} DefaultComponent={RecordHeading} showSearches showDownload />
    : <RecordHeading {...props} />
)
