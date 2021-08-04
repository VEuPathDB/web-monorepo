import React from 'react';
import { useLocation } from 'react-router-dom';

import { useEda } from '@veupathdb/web-common/lib/config';

import { withPermissions } from '@veupathdb/web-common/lib/components/Permissions';
import StudyRecordHeading from '@veupathdb/web-common/lib/component-wrappers/StudyRecordHeading';

const ClinEpiStudyRecordHeading = withPermissions(StudyRecordHeading);

export default RecordHeading => props => {
  const location = useLocation();
  const isRecordRoute = location.pathname.startsWith('/record');
  return (
    props.recordClass.urlSegment === 'dataset'
      ? <ClinEpiStudyRecordHeading
          {...props}
          DefaultComponent={RecordHeading}
          showSearches={!useEda}
          showDownload={!useEda}
          showAnalyzeLink={useEda && isRecordRoute}
        />
      : <RecordHeading {...props} />
  )
}
