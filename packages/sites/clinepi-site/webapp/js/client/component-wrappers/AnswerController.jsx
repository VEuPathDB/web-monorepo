import React from 'react';
import StudyAnswerController from './StudyAnswerController';

export default AnswerController => props => {
  if (props.ownProps.recordClass  === 'dataset') {
    return <StudyAnswerController {...props} DefaultComponent={AnswerController} />;
  }
  return <AnswerController {...props} />
}
