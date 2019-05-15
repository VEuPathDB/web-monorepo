import React from 'react';

import { memoize } from 'lodash';

import { DispatchAction } from 'wdk-client/Core/CommonTypes';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { submitQuestion } from 'wdk-client/Actions/QuestionActions';
import { SubmitButton, Props } from 'wdk-client/Views/Question/DefaultQuestionForm';

import 'wdk-client/Views/Question/DefaultQuestionForm.scss';

const cx = makeClassNameHelper('wdk-QuestionForm');

const onSubmit = memoize((dispatchAction: DispatchAction, urlSegment: string) => (e: React.FormEvent) => {
  e.preventDefault();
  dispatchAction(submitQuestion({ searchName: urlSegment }));
});

export const ByGenotypeNumber: React.FunctionComponent<Props> = ({
  dispatchAction,
  state: {
    question: {
      urlSegment
    }
  },
  parameterElements
}) =>
  <div className={`${cx()} ${cx('ByGenotypeNumber')}`}>
    <h1>Identify RFLP Genotype Isolates based on RFLP Genotype Number</h1>
    <form onSubmit={onSubmit(dispatchAction, urlSegment)}>
      {parameterElements.genotype}
      <div className={cx('SubmitSection')}>
        <SubmitButton />
      </div>
    </form>
  </div>;
