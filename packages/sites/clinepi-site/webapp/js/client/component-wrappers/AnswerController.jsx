import React from 'react';

import StudyAnswerController from '@veupathdb/web-common/lib/component-wrappers/StudyAnswerController';

import { withPermissions } from '@veupathdb/study-data-access/lib/data-restriction/Permissions';

const ClinEpiStudyAnswerController = withPermissions(StudyAnswerController);

export default (AnswerController) => (props) => {
  if (props.ownProps.recordClass === 'dataset') {
    return (
      <ClinEpiStudyAnswerController
        {...props}
        DefaultComponent={AnswerController}
      />
    );
  }

  return <AnswerController {...props} />;
};
