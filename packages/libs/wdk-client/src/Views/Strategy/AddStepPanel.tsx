import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { RootState } from 'wdk-client/Core/State/Types';
import { emptyAction } from 'wdk-client/Core/WdkMiddleware';
import { Question, Identifier, RecordClass } from 'wdk-client/Utils/WdkModel';
import { requestStrategy } from 'wdk-client/Actions/StrategyActions';
import { compose } from 'redux';
import { Loading } from 'wdk-client/Components';
import { NewStepSpec, StrategyDetails } from 'wdk-client/Utils/WdkUser';
import { updateActiveQuestion } from 'wdk-client/Actions/QuestionActions';
import { QuestionState } from 'wdk-client/StoreModules/QuestionStoreModule';

type StateProps = {
  strategy?: StrategyDetails,
  recordClass?: RecordClass,
  recordClassSegment?: string,
  booleanSearchState?: QuestionState,
  basketSearchState?: QuestionState
};

type DispatchProps = {
  createSteps: (newStepSpecs: NewStepSpec[], onCreation: (specIds: Identifier[]) => void) => void
  loadBooleanQuestion: (recordClassSegment: string) => void,
  loadBasketQuestion: (recordClassSegment: string) => void,
  loadStrategy: (strategyId: number) => void,
};

type OwnProps = {
  addType: InsertBefore | Append
  strategyId: number,
};

type InsertBefore = {
  type: 'insertBefore',
  stepId: number
};

type Append = {
  type: 'append'
};

type Props = StateProps & DispatchProps & OwnProps;

type NewStepSearchMap = Record<'combineNewSearch' | 'transformSearch' | 'colocationSearch', Question[]>;

const AddStepPanelView = (
  {
    basketSearchState,
    booleanSearchState,
    loadBasketQuestion,
    loadBooleanQuestion,
    loadStrategy,
    recordClass,
    recordClassSegment,
    strategy,
    strategyId
  }: Props
) => {
  useEffect(() => {
    loadStrategy(strategyId);
  }, [ strategyId ]);

  useEffect(() => {
    if (recordClassSegment) {
      loadBasketQuestion(recordClassSegment);
      loadBooleanQuestion(recordClassSegment);
    }
  }, [ recordClassSegment ]);

  return (
    !strategy ||
    !recordClass ||
    !booleanSearchState ||
    !basketSearchState ||
    booleanSearchState.questionStatus === 'loading' ||
    basketSearchState.questionStatus === 'loading'
  )
    ? <Loading />
    : null;
};

const strategy = createSelector(
  ({ strategies }: RootState) => strategies,
  (_: RootState, { strategyId }: OwnProps) => strategyId,
  (strategies, strategyId) => {
    const strategyEntry = strategies.strategies[strategyId];
    
    return (
      !strategyEntry || 
      strategyEntry.isLoading || 
      strategyEntry.status === 'pending'
    )
      ? undefined
      : strategyEntry.strategy;
  }
);

const recordClass = createSelector(
  strategy,
  ({ globalData: { recordClasses } }: RootState) => recordClasses,
  (strategy, recordClasses) => (
    !strategy ||
    !recordClasses
  )
    ? undefined
    : recordClasses.find(({ urlSegment }) => strategy.recordClassName === urlSegment)
);

const recordClassSegment = createSelector(
  recordClass,
  recordClass => recordClass && recordClassFullNameToSegment(recordClass.fullName)
);

const booleanSearchState = createSelector(
  recordClass,
  recordClassSegment,
  ({ question: { questions } }: RootState) => questions,
  (recordClass, recordClassSegment, questions) => {
    if (!recordClass || !recordClassSegment) {
      return undefined;
    }

    return questions[booleanSearchUrlSegment(recordClassSegment)]
  }
);

const basketSearchState = createSelector(
  recordClass,
  recordClassSegment,
  ({ question: { questions } }: RootState) => questions,
  (recordClass, recordClassSegment, questions) => {
    if (!recordClass || !recordClassSegment) {
      return undefined;
    }

    return questions[basketSearchUrlSegment(recordClassSegment)]
  }
);

const recordClassFullNameToSegment = (recordClassFullName: string) =>
  recordClassFullName.replace('.', '_');

const basketSearchUrlSegment = (recordClassSegment: string) =>
  `${recordClassSegment}BySnapshotBasket`;

const booleanSearchUrlSegment = (recordClassSegment: string) =>
  `boolean_question_${recordClassSegment}`;

const booleanLeftOperand = (recordClassSegment: string) =>
  `bq_left_op_${recordClassSegment}`;

const booleanRightOperand = (recordClassSegment: string) =>
  `bq_right_op_${recordClassSegment}`;

// A "new search" specifies a valid boolean operand <=> 
//   (1) it has no primary nor secondary input 
//   (2) its output record class matches the current record class
const isValidBooleanOperand = (
  { allowedPrimaryInputRecordClassNames, allowedSecondaryInputRecordClassNames, outputRecordClassName }: Question,
  recordClassUrlSegment: string
) =>
  !allowedPrimaryInputRecordClassNames &&
  !allowedSecondaryInputRecordClassNames &&
  outputRecordClassName === recordClassUrlSegment;

// A search specifies a valid transform <=>
//   (1) it has a primary input and NO seconary input
//   (2) its primary input is compatible with the current record class
const isValidTransform = (
  { allowedPrimaryInputRecordClassNames, allowedSecondaryInputRecordClassNames }: Question,
  recordClassFullName: string
) => 
  (
    !allowedPrimaryInputRecordClassNames ||
    allowedSecondaryInputRecordClassNames
  )
    ? false
    : allowedPrimaryInputRecordClassNames.includes(recordClassFullName);

export const AddStepPanel = connect<StateProps, DispatchProps, OwnProps, Props, RootState>(
  (state, ownProps) => ({
    basketSearchState: basketSearchState(state, ownProps),
    booleanSearchState: booleanSearchState(state, ownProps),
    recordClass: recordClass(state, ownProps),
    recordClassSegment: recordClassSegment(state, ownProps),
    strategy: strategy(state, ownProps)
  }),
  dispatch => ({
    createSteps: (newStepSpecs: NewStepSpec[], onCreation: (specIds: Identifier[]) => void) => {
      dispatch(async ({ wdkService }) => {
        const identifiers = await Promise.all(newStepSpecs.map(spec => wdkService.createStep(spec)));
        onCreation(identifiers);
        return emptyAction;
      });
    },
    loadBasketQuestion: (recordClassSegment: string) => {
      dispatch(
        updateActiveQuestion({
          searchName: basketSearchUrlSegment(recordClassSegment),
          stepId: undefined
        })
      )
    },
    loadBooleanQuestion: (recordClassSegment: string) => {
      dispatch(
        updateActiveQuestion({
          searchName: booleanSearchUrlSegment(recordClassSegment),
          stepId: undefined,
          paramValues: {
            [booleanLeftOperand(recordClassSegment)]: '',
            [booleanRightOperand(recordClassSegment)]: '',
            bq_operator: 'intersect'
          }
        })
      )
    },
    loadStrategy: compose(dispatch, requestStrategy)
  }),
  (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    ...dispatchProps,
    ...ownProps
  })
)(AddStepPanelView);
