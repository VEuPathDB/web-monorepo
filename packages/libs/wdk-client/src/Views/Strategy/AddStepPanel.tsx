import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createSelector } from 'reselect';

import { requestStrategy, requestPutStrategyStepTree } from 'wdk-client/Actions/StrategyActions';
import { Loading } from 'wdk-client/Components';
import { RootState } from 'wdk-client/Core/State/Types';
import { RecordClass } from 'wdk-client/Utils/WdkModel';
import { StrategyDetails, StepTree, Step } from 'wdk-client/Utils/WdkUser';
import { Plugin } from 'wdk-client/Utils/ClientPlugin';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { findPrimaryBranchHeight, addStep, findSubtree, findPrimaryBranchLeaf } from 'wdk-client/Utils/StrategyUtils';
import { AddType } from 'wdk-client/Views/Strategy/Types';

import 'wdk-client/Views/Strategy/AddStepPanel.scss';

const cx = makeClassNameHelper('AddStepPanel');

type StateProps = {
  strategy?: StrategyDetails,
  inputRecordClass?: RecordClass,
  previousStepNumber?: number,
  previousStep?: Step,
  operandStep?: Step
};

type DispatchProps = {
  loadStrategy: (strategyId: number) => void,
  requestPutStrategyStepTree: (strategyId: number, newStepTree: StepTree) => void
};

type OwnProps = {
  addType: AddType,
  strategyId: number
};

type Props = StateProps & DispatchProps & OwnProps;

export type AddStepOperationMenuProps = {
  strategy: StrategyDetails,
  inputRecordClass: RecordClass,
  startOperationForm: (selection: string) => void,
  updateStrategy: (newStepId: number, newSecondaryInput: StepTree) => void,
  addType: AddType
};

export type AddStepOperationFormProps = {
  strategy: StrategyDetails,
  inputRecordClass: RecordClass,
  currentPage: string,
  advanceToPage: (nextPage: string) => void,
  updateStrategy: (newStepId: number, newSecondaryInput: StepTree) => void,
  addType: AddType
};

const AddStepPanelView = (
  {
    addType,
    loadStrategy,
    inputRecordClass,
    requestPutStrategyStepTree,
    strategy,
    strategyId,
    previousStepNumber,
    operandStep
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
        addType,
        newStepId,
        newSecondaryInput
      );

      requestPutStrategyStepTree(strategy.strategyId, newStepTree);
    }
  }, [ strategy, requestPutStrategyStepTree, addType ]);

  return (
    <div className={cx()}>
      {
        (
          strategy === undefined ||
          inputRecordClass === undefined ||
          previousStepNumber === undefined ||
          operandStep === undefined
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
                        It found {operandStep.estimatedSize} {
                          operandStep.estimatedSize === 1 
                            ? inputRecordClass.shortDisplayName
                            : inputRecordClass.shortDisplayNamePlural
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
                              inputRecordClass,
                              startOperationForm: startOperationFormCallbacks[operation],
                              updateStrategy,
                              addType
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
                          inputRecordClass,
                          currentPage,
                          advanceToPage,
                          updateStrategy,
                          addType
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

const previousStepSubtree = createSelector(
  strategy,
  (_: RootState, { addType }) => addType,
  (strategy, addType) => {
    if (strategy === undefined) {
      return undefined;
    }

    if (addType.type === 'append') {
      return findSubtree(
        strategy.stepTree,
        addType.primaryInputStepId
      );
    }

    const insertionPointSubtree = findSubtree(
      strategy.stepTree,
      addType.outputStepId
    );

    return insertionPointSubtree && insertionPointSubtree.primaryInput;
  }
);

const previousStepNumber = createSelector(
  previousStepSubtree,
  previousStepSubtree => previousStepSubtree === undefined
    ? 0
    : findPrimaryBranchHeight(previousStepSubtree) + 1
);

const previousStep = createSelector(
  strategy,
  previousStepSubtree,
  (strategy, previousStepSubtree) => 
    strategy === undefined || previousStepSubtree === undefined
      ? undefined
      : strategy.steps[previousStepSubtree.stepId]
);

const operandStep = createSelector(
  strategy,
  previousStep,
  (strategy, previousStep) => strategy === undefined
    ? undefined
    : previousStep !== undefined
    ? previousStep
    : strategy.steps[findPrimaryBranchLeaf(strategy.stepTree).stepId]
);

const inputRecordClass = createSelector(
  strategy,
  operandStep,
  ({ globalData: { recordClasses } }: RootState) => recordClasses,
  (_, { addType }) => addType,
  (strategy, operandStep, recordClasses, addType) => {
    if (strategy === undefined || operandStep === undefined || recordClasses === undefined) {
      return undefined;
    }

    const inputRecordClassName = addType.type === 'insert-before'
      ? operandStep.recordClassName
      : strategy.steps[addType.primaryInputStepId].recordClassName;

    return recordClasses.find(({ urlSegment }) => urlSegment === inputRecordClassName);
  }
);

export const AddStepPanel = connect<StateProps, DispatchProps, OwnProps, Props, RootState>(
  (state, ownProps) => ({
    inputRecordClass: inputRecordClass(state, ownProps),
    strategy: strategy(state, ownProps),
    previousStepNumber: previousStepNumber(state, ownProps),
    previousStep: previousStep(state, ownProps),
    operandStep: operandStep(state, ownProps)
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
