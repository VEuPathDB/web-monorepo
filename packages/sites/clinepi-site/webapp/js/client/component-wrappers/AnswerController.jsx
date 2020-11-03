import React from 'react';

import { withPermissions } from 'ebrc-client/components/Permissions';
import StudyAnswerController from 'ebrc-client/component-wrappers/StudyAnswerController';

const ClinEpiStudyAnswerController = withPermissions(StudyAnswerController);

export default AnswerController => props => {
  if (props.ownProps.recordClass  === 'dataset') {
    return <ClinEpiStudyAnswerController {...props} DefaultComponent={AnswerController} />;
  }
  return <AnswerController {...props} />
}
