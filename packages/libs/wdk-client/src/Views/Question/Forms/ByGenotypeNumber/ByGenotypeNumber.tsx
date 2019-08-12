import React from 'react';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { SubmitButton, Props, QuestionHeader, QuestionDescription, useDefaultOnSubmit } from 'wdk-client/Views/Question/DefaultQuestionForm';

import 'wdk-client/Views/Question/DefaultQuestionForm.scss';

const cx = makeClassNameHelper('wdk-QuestionForm');

export const ByGenotypeNumber: React.FunctionComponent<Props> = ({
  dispatchAction,
  state: {
    question: {
      description,
      displayName,
      urlSegment
    }
  },
  parameterElements,
  submissionMetadata
}) => {
  const onSubmit = useDefaultOnSubmit(dispatchAction, urlSegment, submissionMetadata);

  return (
    <div className={`${cx()} ${cx('ByGenotypeNumber')}`}>
      <QuestionHeader headerText={displayName} showHeader={submissionMetadata.type === 'create-strategy' || submissionMetadata.type === 'edit-step'} />
      <form onSubmit={onSubmit}>
        {parameterElements.genotype}
        <div className={cx('SubmitSection')}>
          <SubmitButton submissionMetadata={submissionMetadata} />
        </div>
      </form>
      <QuestionDescription description={description} />
    </div>
  );
};
