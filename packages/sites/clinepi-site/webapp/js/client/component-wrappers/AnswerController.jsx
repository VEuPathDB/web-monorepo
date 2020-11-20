import React from 'react';

import { withPermissions } from '@veupathdb/web-common/lib/components/Permissions';
import StudyAnswerController from '@veupathdb/web-common/lib/component-wrappers/StudyAnswerController';

const ClinEpiStudyAnswerController = withPermissions(StudyAnswerController);

export default AnswerController => props => {
  if (props.ownProps.recordClass  === 'dataset') {
    return <ClinEpiStudyAnswerController {...props} DefaultComponent={AnswerController} />;
  }
  return <AnswerController {...props} />
}
