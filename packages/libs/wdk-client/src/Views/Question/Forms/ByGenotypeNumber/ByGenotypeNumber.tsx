import React from 'react';

import { memoize } from 'lodash';

import { DispatchAction } from 'wdk-client/Core/CommonTypes';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { submitQuestion, SubmissionMetadata } from 'wdk-client/Actions/QuestionActions';
import { SubmitButton, Props, QuestionHeader, QuestionDescription } from 'wdk-client/Views/Question/DefaultQuestionForm';

import 'wdk-client/Views/Question/DefaultQuestionForm.scss';

const cx = makeClassNameHelper('wdk-QuestionForm');

const onSubmit = memoize((dispatchAction: DispatchAction, urlSegment: string, submissionMetadata: SubmissionMetadata) => (e: React.FormEvent) => {
  e.preventDefault();
  dispatchAction(submitQuestion({ searchName: urlSegment, submissionMetadata }));
});

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
}) =>
  <div className={`${cx()} ${cx('ByGenotypeNumber')}`}>
    <QuestionHeader headerText={displayName} showHeader={submissionMetadata.type === 'create-strategy' || submissionMetadata.type === 'edit-step'} />
    <form onSubmit={onSubmit(dispatchAction, urlSegment, submissionMetadata)}>
      {parameterElements.genotype}
      <div className={cx('SubmitSection')}>
        <SubmitButton submissionMetadata={submissionMetadata} />
      </div>
    </form>
    <QuestionDescription description={description} />
  </div>;
