import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createSelector } from 'reselect';

import { requestStrategy, requestPutStrategyStepTree } from 'wdk-client/Actions/StrategyActions';
import { Loading } from 'wdk-client/Components';
import { RootState } from 'wdk-client/Core/State/Types';
import { RecordClass } from 'wdk-client/Utils/WdkModel';
import { StrategyDetails, StepTree } from 'wdk-client/Utils/WdkUser';
import { Plugin } from 'wdk-client/Utils/ClientPlugin';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { appendStep, insertStepBefore } from 'wdk-client/Utils/StrategyUtils';

import 'wdk-client/Views/Strategy/AddStepPanel.scss';

const cx = makeClassNameHelper('AddStepPanel');

type StateProps = {
  strategy?: StrategyDetails,
  recordClass?: RecordClass
};

type DispatchProps = {
  loadStrategy: (strategyId: number) => void,
  requestPutStrategyStepTree: (strategyId: number, newStepTree: StepTree) => void
};

type OwnProps = {
  addType: InsertBefore | Append,
  strategyId: number
};

type InsertBefore = {
  type: 'insertBefore',
  stepId: number
};

type Append = {
  type: 'append'
};

type Props = Partial<StateProps> & DispatchProps & OwnProps;

export type AddStepOperationMenuProps = {
  strategy: StrategyDetails,
  recordClass: RecordClass,
  startOperationForm: (selection: string) => void,
  updateStrategy: (newStepId: number, newSecondaryInput: StepTree) => void,
  insertionPoint: number | undefined
};

export type AddStepOperationFormProps = {
  strategy: StrategyDetails,
  recordClass: RecordClass,
  currentPage: string,
  advanceToPage: (nextPage: string) => void,
  updateStrategy: (newStepId: number, newSecondaryInput: StepTree) => void,
  insertionPoint: number | undefined
};

const AddStepPanelView = (
  {
    addType,
    loadStrategy,
    recordClass,
    requestPutStrategyStepTree,
    strategy,
    strategyId
  }: Props
) => {
  useEffect(() => {
    loadStrategy(strategyId);
  }, [ strategyId ]);

  const [ selectedOperation, setSelectedOperation ] = useState<string | undefined>(undefined);
  const [ pageHistory, setPageHistory ] = useState<string[]>([]);

  const currentPage = pageHistory[pageHistory.length - 1];

  const onClickBack = useCallback(() => {
    const newPageHistory = pageHistory.slice(0, -1);
    if (newPageHistory.length === 0) {
      setSelectedOperation(undefined);
    }
    setPageHistory(pageHistory.slice(0, -1));
  }, [ pageHistory ]);

  const advanceToPage = useCallback((nextPage: string) => {
    setPageHistory([...pageHistory, nextPage]);
  }, [ pageHistory ]);

  const startOperationFormCallbacks = useMemo(
    () => OPERATION_TYPE_ORDER.reduce(
      (memo, operation) => ({
        ...memo,
        [operation]: (selection: string) => {
          setSelectedOperation(operation);
          advanceToPage(selection);
        }
      }),
      {} as Record<string, (selection: string) => void>
    ),
    [ OPERATION_TYPE_ORDER, advanceToPage ]
  );

  const updateStrategy = useCallback((newStepId: number, newSecondaryInput: StepTree) => {
    if (strategy) {
      const oldStepTree = strategy.stepTree;

      const newStepTree = addType.type === 'append'
        ? appendStep(oldStepTree, newStepId, newSecondaryInput)
        : insertStepBefore(oldStepTree, addType.stepId, newStepId, newSecondaryInput);

      requestPutStrategyStepTree(strategy.strategyId, newStepTree);
    }
  }, [ strategy, requestPutStrategyStepTree, addType ]);

  const insertionPoint = addType.type === 'insertBefore'
    ? addType.stepId
    : undefined;

  return (
    <div className={cx()}>
      {
        (
          !strategy ||
          !recordClass
        )
          ? <Loading />
          : !selectedOperation
          ? (
            <div>
              {
                OPERATION_TYPE_ORDER.map(operation =>
                  <Plugin<AddStepOperationMenuProps>
                    key={operation}
                    context={{
                      type: 'addStepOperationMenu',
                      name: operation
                    }}
                    pluginProps={{
                      strategy,
                      recordClass,
                      startOperationForm: startOperationFormCallbacks[operation],
                      updateStrategy,
                      insertionPoint
                    }}
                  />
                )
              }
            </div>
          )
          : (
            <div>
              <a href="#" onClick={onClickBack}>
                Go Back
              </a>
              <Plugin<AddStepOperationFormProps>
                context={{
                  type: 'addStepOperationForm',
                  name: selectedOperation
                }}
                pluginProps={{
                  strategy,
                  recordClass,
                  currentPage,
                  advanceToPage,
                  updateStrategy,
                  insertionPoint
                }}
              />
            </div>
          )
      }
    </div>
  )
};

// TODO Make this configurable
enum OperationTypes {
  Combine = 'combine',
  Convert = 'convert'
}

const OPERATION_TYPE_ORDER  = [
  OperationTypes.Combine,
  OperationTypes.Convert
];

export const strategy = createSelector(
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

export const recordClass = createSelector(
  strategy,
  ({ globalData: { recordClasses } }: RootState) => recordClasses,
  (strategy, recordClasses) => (
    !strategy ||
    !recordClasses
  )
    ? undefined
    : recordClasses.find(({ urlSegment }) => strategy.recordClassName === urlSegment)
);

export const AddStepPanel = connect<StateProps, DispatchProps, OwnProps, Props, RootState>(
  (state, ownProps) => ({
    recordClass: recordClass(state, ownProps),
    strategy: strategy(state, ownProps)
  }),
  dispatch => ({
    loadStrategy: compose(dispatch, requestStrategy),
    requestPutStrategyStepTree: compose(dispatch, requestPutStrategyStepTree)
  }),
  (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    ...dispatchProps,
    ...ownProps
  })
)(AddStepPanelView);
