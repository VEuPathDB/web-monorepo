import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createSelector } from 'reselect';

import { QuestionController } from 'wdk-client/Controllers';
import { RootState } from 'wdk-client/Core/State/Types';
import { QuestionState } from 'wdk-client/StoreModules/QuestionStoreModule';
import { AddStepOperationFormProps } from 'wdk-client/Views/Strategy/AddStepPanel';
import { BOOLEAN_OPERATOR_PARAM_NAME, combineOperatorOrder, CombineOperator } from 'wdk-client/Views/Strategy/StrategyUtils';
import { Parameter } from 'wdk-client/Utils/WdkModel';

import { updateParamValue } from 'wdk-client/Actions/QuestionActions';
import { SingleSelect } from 'wdk-client/Components';

const selectVerbiage: Record<CombineOperator, string> = {
  [CombineOperator.Intersect]: 'intersected with', 
  [CombineOperator.Union]: 'unioned with', 
  [CombineOperator.LeftMinus]: 'subtracted by', 
  [CombineOperator.RightMinus]: 'subtracted from'
};

const selectItems = combineOperatorOrder.map(
  operator => ({
    value: operator,
    display: selectVerbiage[operator]
  })
);


type StateProps = {
  booleanSearchUrlSegment: string,
  booleanSearchState?: QuestionState,
  booleanOperatorParameter?: Parameter
};

type DispatchProps = {
  updateParamValue: (payload: {
    searchName: string,
    parameter: Parameter, 
    paramValues: Record<string, string>, 
    paramValue: string
  }) => void
};

const recordClassSegment = createSelector(
  (_: RootState, { recordClass }: OwnProps) => recordClass,
  recordClass => recordClass && recordClass.fullName.replace('.', '_')
);

const booleanSearchUrlSegment = createSelector(
  recordClassSegment,
  recordClassSegment => `boolean_question_${recordClassSegment}`
);

const booleanSearchState = createSelector(
  ({ question: { questions } }: RootState) => questions,
  booleanSearchUrlSegment,
  (questions, booleanSearchUrlSegment) => questions[booleanSearchUrlSegment]
);

const booleanOperatorParameter = createSelector(
  booleanSearchState,
  booleanSearchState => {
    if (!booleanSearchState || booleanSearchState.questionStatus === 'loading') {
      return undefined;
    }

    const booleanOperatorEntry = booleanSearchState.question.parametersByName[BOOLEAN_OPERATOR_PARAM_NAME];

    if (!booleanOperatorEntry) {
      return undefined;
    }

    return booleanOperatorEntry;
  }
);

type OwnProps = AddStepOperationFormProps;

type CombineStepFormViewProps = StateProps & {
  updateBooleanOperator: (newBooleanOperator: string) => void
} & OwnProps;

const CombineStepFormView = ({
  booleanSearchUrlSegment,
  booleanSearchState,
  currentPage,
  insertionPoint,
  recordClass,
  strategy,
  updateBooleanOperator
}: CombineStepFormViewProps) => (
  <div>
    <SingleSelect
      value={booleanSearchState && booleanSearchState.paramValues[BOOLEAN_OPERATOR_PARAM_NAME]}
      onChange={updateBooleanOperator}
      items={selectItems}
    />
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
  </div>
);

export const CombineStepForm = connect<StateProps, DispatchProps, OwnProps, CombineStepFormViewProps, RootState>(
  (state, ownProps) => ({
    booleanSearchUrlSegment: booleanSearchUrlSegment(state, ownProps),
    booleanSearchState: booleanSearchState(state, ownProps),
    booleanOperatorParameter: booleanOperatorParameter(state, ownProps)
  }),
  dispatch => ({
    updateParamValue: compose(dispatch, updateParamValue)
  }),
  (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    updateBooleanOperator: (newBooleanOperator: string) => {
      if (stateProps.booleanSearchState && stateProps.booleanOperatorParameter) {
        dispatchProps.updateParamValue({
          searchName: stateProps.booleanSearchUrlSegment,
          parameter: stateProps.booleanOperatorParameter,
          paramValues: stateProps.booleanSearchState.paramValues,
          paramValue: newBooleanOperator
        });
      }
    },
    ...ownProps
  })
)(CombineStepFormView);
