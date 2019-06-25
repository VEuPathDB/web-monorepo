import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { RootState } from 'wdk-client/Core/State/Types';
import { ActionCreatorServices as WdkEffectCallbackServices, emptyAction } from 'wdk-client/Core/WdkMiddleware';
import { Question } from 'wdk-client/Utils/WdkModel';
import { requestStrategy } from 'wdk-client/Actions/StrategyActions';
import { bindActionCreators } from 'redux';
import { StrategyEntry } from 'wdk-client/StoreModules/StrategyStoreModule';
import { Loading } from 'wdk-client/Components';

type StateProps = {
  strategyEntry?: StrategyEntry
};

type DispatchProps = {
  requestStrategy: typeof requestStrategy,
  useWdkEffect: (effect: WdkEffectCallback, deps?: any[] | undefined) => void
};


type WdkEffectCallback = 
  ((wdkEffectServices: WdkEffectCallbackServices) => void) | 
  ((wdkEffectServices: WdkEffectCallbackServices) => void | undefined);

type OwnProps = {
  strategyId: number,
  addType: InsertBefore | Append
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
    requestStrategy,
    strategyEntry,
    strategyId
  }: Props
) => {
  useEffect(() => {
    requestStrategy(strategyId);
  }, [ strategyId ]);

  return !strategyEntry || strategyEntry.isLoading
    ? <Loading />
    : null;
};

const strategyEntry = createSelector(
  ({ strategies }: RootState) => strategies,
  (_: RootState, { strategyId }: OwnProps) => strategyId,
  (strategies, strategyId) => strategies.strategies[strategyId]
);

const recordClassSegment = (recordClassFullName: string) =>
  recordClassFullName.replace('.', '_');

const basketSearchUrlSegment = (recordClassSegment: string) =>
  `${recordClassSegment}ByBasketSnapshot`;

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
    strategyEntry: strategyEntry(state, ownProps)
  }),
  dispatch => ({
    ...bindActionCreators(
      {
        requestStrategy
      },
      dispatch
    ),
    useWdkEffect: (effect: WdkEffectCallback, deps?: any[] | undefined) => {
      useEffect(() => {
        dispatch(services => {
          effect(services);
          return emptyAction;
        });
      }, deps);
    }
  }),
  (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    ...dispatchProps,
    ...ownProps
  })
)(AddStepPanelView);
