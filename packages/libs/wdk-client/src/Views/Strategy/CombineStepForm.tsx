import React from 'react';
import { createSelector } from 'reselect';

import { QuestionController } from 'wdk-client/Controllers';
import { RootState } from 'wdk-client/Core/State/Types';
import { AddStepOperationFormProps } from 'wdk-client/Views/Strategy/AddStepPanel';
import { connect } from 'react-redux';

const recordClassSegment = createSelector(
  (_: RootState, { recordClass }: OwnProps) => recordClass,
  recordClass => recordClass && recordClass.fullName.replace('.', '_')
);

const booleanSearchUrlSegment = createSelector(
  recordClassSegment,
  recordClassSegment => `boolean_question_${recordClassSegment}`
);

type StateProps = {
  booleanSearchUrlSegment: string
};

type OwnProps = AddStepOperationFormProps;

type CombineStepFormViewProps = StateProps & OwnProps;

const CombineStepFormView = ({
  booleanSearchUrlSegment,
  currentPage,
  insertionPoint,
  recordClass,
  strategy
}: CombineStepFormViewProps) => (
  <QuestionController
    question={currentPage}
    recordClass={recordClass.urlSegment}
    submissionMetadata={{
      type: 'add-binary-step',
      strategyId: strategy.strategyId,
      operatorSearchName: booleanSearchUrlSegment,
      insertionPoint
    }}
  />
);

export const CombineStepForm = connect<StateProps, CombineStepFormViewProps, AddStepOperationFormProps, RootState>(
  (state, ownProps) => ({
    booleanSearchUrlSegment: booleanSearchUrlSegment(state, ownProps)
  })
)(CombineStepFormView);
