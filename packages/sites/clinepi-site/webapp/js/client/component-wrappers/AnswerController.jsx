import React from 'react';

import UDAnswerController from '@veupathdb/web-common/lib/component-wrappers/UDAnswerController';
import { MergedDatasetsAnswer } from './AllDatasetsAnswerController';

export default (AnswerController) => (props) => {
  if (
    props.ownProps.recordClass === 'dataset' &&
    props.ownProps.question === 'AllDatasets'
  ) {
    return (
      <MergedDatasetsAnswer {...props} DefaultComponent={AnswerController} />
    );
  }

  if (props.ownProps.recordClass === 'userdataset') {
    return (
      <UDAnswerController {...props} DefaultComponent={AnswerController} />
    );
  }

  return <AnswerController {...props} />;
};
