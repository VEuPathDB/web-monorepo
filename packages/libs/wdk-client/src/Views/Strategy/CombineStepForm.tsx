import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createSelector } from 'reselect';

import {
  SubmissionMetadata,
  updateParamValue,
} from '../../Actions/QuestionActions';
import { RootState } from '../../Core/State/Types';
import { Loading } from '../../Components';
import { QuestionState } from '../../StoreModules/QuestionStoreModule';
import { Plugin } from '../../Utils/ClientPlugin';
import { makeClassNameHelper } from '../../Utils/ComponentUtils';
import { Parameter } from '../../Utils/WdkModel';
import { AddStepOperationFormProps } from '../../Views/Strategy/AddStepPanel';
import { BooleanSelect } from '../../Views/Strategy/BooleanSelect';
import {
  BOOLEAN_OPERATOR_PARAM_NAME,
  CombineOperator,
} from '../../Views/Strategy/StrategyUtils';

import '../../Views/Strategy/CombineStepForm.scss';

const cx = makeClassNameHelper('CombineStepForm');

type StateProps = {
  booleanSearchUrlSegment: string;
  booleanSearchState?: QuestionState;
  booleanOperatorParameter?: Parameter;
};

type DispatchProps = {
  updateParamValue: (payload: {
    searchName: string;
    parameter: Parameter;
    paramValues: Record<string, string>;
    paramValue: string;
  }) => void;
};

const recordClassSegment = createSelector(
  (_: RootState, { inputRecordClass }: OwnProps) => inputRecordClass,
  (recordClass) => recordClass && recordClass.fullName.replace('.', '_')
);

const booleanSearchUrlSegment = createSelector(
  recordClassSegment,
  (recordClassSegment) => `boolean_question_${recordClassSegment}`
);

const booleanSearchState = createSelector(
  ({ question: { questions } }: RootState) => questions,
  booleanSearchUrlSegment,
  (questions, booleanSearchUrlSegment) => questions[booleanSearchUrlSegment]
);

const booleanOperatorParameter = createSelector(
  booleanSearchState,
  (booleanSearchState) => {
    if (
      !booleanSearchState ||
      booleanSearchState.questionStatus === 'loading'
    ) {
      return undefined;
    }

    const booleanOperatorEntry =
      booleanSearchState.question.parametersByName[BOOLEAN_OPERATOR_PARAM_NAME];

    if (!booleanOperatorEntry) {
      return undefined;
    }

    return booleanOperatorEntry;
  }
);

type OwnProps = AddStepOperationFormProps;

type CombineStepFormViewProps = StateProps & {
  updateBooleanOperator: (newBooleanOperator: CombineOperator) => void;
} & OwnProps;

const CombineStepFormView = ({
  booleanSearchUrlSegment,
  booleanSearchState,
  currentPage,
  addType,
  inputRecordClass,
  strategy,
  updateBooleanOperator,
  stepsCompletedNumber,
}: CombineStepFormViewProps) => {
  const question = useMemo(
    () =>
      inputRecordClass.searches.find(
        ({ urlSegment }) => urlSegment === currentPage
      ),
    [inputRecordClass, currentPage]
  );

  const submissionMetadata: SubmissionMetadata = useMemo(
    () => ({
      type: 'add-binary-step',
      strategyId: strategy.strategyId,
      operatorSearchName: booleanSearchUrlSegment,
      addType,
    }),
    [addType, booleanSearchUrlSegment, strategy.strategyId]
  );

  return !booleanSearchState ||
    booleanSearchState.questionStatus === 'loading' ? (
    <Loading />
  ) : (
    <div className={cx()}>
      <div className={cx('--Header')}>
        <h2>
          Search for {inputRecordClass.shortDisplayNamePlural}{' '}
          {question && `by ${question.displayName}`}
        </h2>

        <div className={cx('--BooleanOperatorMenu')}>
          The results will be{' '}
          <BooleanSelect
            addType={addType}
            value={
              booleanSearchState.paramValues[
                BOOLEAN_OPERATOR_PARAM_NAME
              ] as CombineOperator
            }
            onChange={updateBooleanOperator}
          />{' '}
          the results of Step {stepsCompletedNumber}.
        </div>
      </div>
      <div className={cx('--Body')}>
        <Plugin
          context={{
            type: 'questionController',
            searchName: currentPage,
            recordClassName: inputRecordClass.urlSegment,
          }}
          pluginProps={{
            question: currentPage,
            recordClass: inputRecordClass.urlSegment,
            submissionMetadata,
          }}
          fallback={<Loading />}
        />
      </div>
    </div>
  );
};

export const CombineStepForm = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  CombineStepFormViewProps,
  RootState
>(
  (state, ownProps) => ({
    booleanSearchUrlSegment: booleanSearchUrlSegment(state, ownProps),
    booleanSearchState: booleanSearchState(state, ownProps),
    booleanOperatorParameter: booleanOperatorParameter(state, ownProps),
  }),
  (dispatch) => ({
    updateParamValue: compose(dispatch, updateParamValue),
  }),
  (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    updateBooleanOperator: (newBooleanOperator: CombineOperator) => {
      if (
        stateProps.booleanSearchState &&
        stateProps.booleanOperatorParameter
      ) {
        dispatchProps.updateParamValue({
          searchName: stateProps.booleanSearchUrlSegment,
          parameter: stateProps.booleanOperatorParameter,
          paramValues: stateProps.booleanSearchState.paramValues,
          paramValue: newBooleanOperator,
        });
      }
    },
    ...ownProps,
  })
)(CombineStepFormView);
