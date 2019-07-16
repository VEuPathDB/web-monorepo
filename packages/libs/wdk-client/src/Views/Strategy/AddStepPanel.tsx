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
import { findPreviousStepSubtree, findPrimaryBranchDepth, addStep } from 'wdk-client/Utils/StrategyUtils';

import 'wdk-client/Views/Strategy/AddStepPanel.scss';

const cx = makeClassNameHelper('AddStepPanel');

type StateProps = {
  strategy?: StrategyDetails,
  recordClass?: RecordClass
  previousStepNumber?: number,
  previousStepId?: number
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

type Props = StateProps & DispatchProps & OwnProps;

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
    strategyId,
    previousStepNumber,
    previousStepId
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

      const newStepTree = addStep(
        oldStepTree,
        addType.type === 'append' ? undefined : addType.stepId,
        newStepId,
        newSecondaryInput
      );

      requestPutStrategyStepTree(strategy.strategyId, newStepTree);
    }
  }, [ strategy, requestPutStrategyStepTree, addType ]);

  const insertionPoint = addType.type === 'insertBefore'
    ? addType.stepId
    : undefined;

  const previousStep = strategy && strategy.steps[previousStepId || insertionPoint || strategy.rootStepId];

  return (
    <div className={cx()}>
      {
        (
          !strategy ||
          !recordClass ||
          !previousStepNumber ||
          !previousStep
        )
          ? <Loading />
          : <div>
              <h1>
                Add a Step to your Strategy
              </h1>
              {
                !selectedOperation
                  ? (
                    <div>
                      <p>
                        So far, your search strategy has {previousStepNumber} {previousStepNumber === 1 ? 'step' : 'steps'}.
                        It found {previousStep.estimatedSize} {
                          previousStep.estimatedSize > 1 
                            ? recordClass.shortDisplayNamePlural
                            : recordClass.shortDisplayName
                          }.
                      </p>
                      <p>
                        Gain data mining power by adding a step to your strategy.  You can...
                      </p>
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

const strategyEntry = createSelector(
  ({ strategies }: RootState) => strategies,
  (_: RootState, { strategyId }: OwnProps) => strategyId,
  (strategies, strategyId) => strategies.strategies[strategyId]
);

const strategy = createSelector(
  strategyEntry,
  strategyEntry => {    
    return (
      !strategyEntry || 
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

const previousStepSubtree = createSelector(
  strategy,
  (_: RootState, { addType }) => addType,
  (strategy, addType) => !strategy
    ? undefined
    : addType.type === 'append'
    ? strategy.stepTree
    : findPreviousStepSubtree(
      strategy.stepTree,
      addType.stepId
    )
);

const previousStepNumber = createSelector(
  previousStepSubtree,
  previousStepSubtree => previousStepSubtree && (findPrimaryBranchDepth(previousStepSubtree) + 1)
);

const previousStepId = createSelector(
  previousStepSubtree,
  previousStepNumber,
  (_: RootState, { addType }) => addType,
  (previousStepSubtree, previousStepNumber, addType) =>
    previousStepNumber === -Infinity || previousStepSubtree === undefined
      ? (addType.type === 'append' ? undefined : addType.stepId)
      : previousStepSubtree.stepId
);

export const AddStepPanel = connect<StateProps, DispatchProps, OwnProps, Props, RootState>(
  (state, ownProps) => ({
    recordClass: recordClass(state, ownProps),
    strategy: strategy(state, ownProps),
    previousStepNumber: previousStepNumber(state, ownProps),
    previousStepId: previousStepId(state, ownProps)
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
