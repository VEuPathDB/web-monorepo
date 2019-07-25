import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createSelector } from 'reselect';

import { updateParamValue } from 'wdk-client/Actions/QuestionActions';
import { SingleSelect } from 'wdk-client/Components';
import { QuestionController } from 'wdk-client/Controllers';
import { RootState } from 'wdk-client/Core/State/Types';
import { QuestionState } from 'wdk-client/StoreModules/QuestionStoreModule';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { Parameter } from 'wdk-client/Utils/WdkModel';
import { AddStepOperationFormProps } from 'wdk-client/Views/Strategy/AddStepPanel';
import { BOOLEAN_OPERATOR_PARAM_NAME, combineOperatorOrder, CombineOperator } from 'wdk-client/Views/Strategy/StrategyUtils';

import 'wdk-client/Views/Strategy/CombineStepForm.scss';

const cx = makeClassNameHelper('CombineStepForm');

const selectVerbiageAppend: Record<CombineOperator, string> = {
  [CombineOperator.Intersect]: 'intersected with', 
  [CombineOperator.Union]: 'unioned with', 
  [CombineOperator.LeftMinus]: 'subtracted by', 
  [CombineOperator.RightMinus]: 'subtracted from'
};

const selectVerbiageInsertBefore: Record<CombineOperator, string> = {
  [CombineOperator.Intersect]: 'intersected with', 
  [CombineOperator.Union]: 'unioned with', 
  [CombineOperator.LeftMinus]: 'subtracted from', 
  [CombineOperator.RightMinus]: 'subtracted by'
};

const selectItemsAppend = combineOperatorOrder.map(
  operator => ({
    value: operator,
    display: selectVerbiageAppend[operator]
  })
);

const selectItemsInsertBefore = combineOperatorOrder.map(
  operator => ({
    value: operator,
    display: selectVerbiageInsertBefore[operator]
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
  (_: RootState, { inputRecordClass }: OwnProps) => inputRecordClass,
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
  addType,
  inputRecordClass,
  strategy,
  updateBooleanOperator,
  stepsCompletedNumber
}: CombineStepFormViewProps) => {
  const question = useMemo(
    () => inputRecordClass.searches.find(({ urlSegment }) => urlSegment === currentPage), 
    [ inputRecordClass, currentPage ]
  );
  
  return (
    <div className={cx()}>
      <div className={cx('--Header')}>
        <h2>
          Search for {inputRecordClass.shortDisplayNamePlural} {question && `by ${question.displayName}`}
        </h2>

        <div>
        The results will be{' '}
          <SingleSelect
            value={booleanSearchState && booleanSearchState.paramValues[BOOLEAN_OPERATOR_PARAM_NAME]}
            onChange={updateBooleanOperator}
            items={addType.type === 'append' ? selectItemsAppend : selectItemsInsertBefore}
          />
          {' '}the results of Step {stepsCompletedNumber}.
        </div>
      </div>
      <div className={cx('--Body')}>
        <QuestionController
          question={currentPage}
          recordClass={inputRecordClass.urlSegment}
          submissionMetadata={{
            type: 'add-binary-step',
            strategyId: strategy.strategyId,
            operatorSearchName: booleanSearchUrlSegment,
            addType
          }}
        />  
      </div>
    </div>
  );
};

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
