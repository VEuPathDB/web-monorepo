import React, { useEffect, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createSelector } from 'reselect';

import { requestStrategy, requestPutStrategyStepTree } from 'wdk-client/Actions/StrategyActions';
import { Loading } from 'wdk-client/Components';
import { RootState } from 'wdk-client/Core/State/Types';
import { RecordClass, Question } from 'wdk-client/Utils/WdkModel';
import { StrategyDetails, StepTree, Step } from 'wdk-client/Utils/WdkUser';
import { Plugin } from 'wdk-client/Utils/ClientPlugin';
import { makeClassNameHelper, wrappable } from 'wdk-client/Utils/ComponentUtils';
import { findPrimaryBranchHeight, addStep, findSubtree, findPrimaryBranchLeaf } from 'wdk-client/Utils/StrategyUtils';
import { AddType } from 'wdk-client/Views/Strategy/Types';

import 'wdk-client/Views/Strategy/AddStepPanel.scss';

const cx = makeClassNameHelper('AddStepPanel');

type StateProps = {
  strategy?: StrategyDetails,
  inputRecordClass?: RecordClass,
  stepsCompletedNumber?: number,
  previousStep?: Step,
  operandStep?: Step,
  questions?: Question[],
  recordClasses?: RecordClass[]
};

type DispatchProps = {
  loadStrategy: (strategyId: number) => void,
  requestPutStrategyStepTree: (strategyId: number, newStepTree: StepTree) => void
};

type OwnProps = {
  addType: AddType,
  strategyId: number,
  operationTypes?: string[],
  developmentMode?: boolean
};

type Props = StateProps & DispatchProps & OwnProps;

export type AddStepOperationMenuProps = {
  strategy: StrategyDetails,
  inputRecordClass: RecordClass,
  startOperationForm: (formType: string, initialPage: string) => void,
  updateStrategy: (newStepId: number, newSecondaryInput: StepTree) => void,
  addType: AddType,
  stepsCompletedNumber: number,
  operandStep: Step,
  previousStep?: Step,
  questions: Question[],
  recordClasses: RecordClass[],
  developmentMode: boolean
};

export type AddStepOperationFormProps = {
  strategy: StrategyDetails,
  inputRecordClass: RecordClass,
  currentPage: string,
  advanceToPage: (nextPage: string) => void,
  updateStrategy: (newStepId: number, newSecondaryInput: StepTree) => void,
  addType: AddType,
  stepsCompletedNumber: number,
  operandStep: Step,
  previousStep?: Step,
  questions: Question[],
  recordClasses: RecordClass[]
};

const defaultOperationTypes = [
  'combine',
  'convert'
];

export const AddStepPanelView = wrappable((
  {
    addType,
    developmentMode = false,
    loadStrategy,
    inputRecordClass,
    operationTypes = defaultOperationTypes,
    operandStep,
    previousStep,
    questions,
    recordClasses,
    requestPutStrategyStepTree,
    strategy,
    strategyId,
    stepsCompletedNumber
  }: Props
) => {
  useEffect(() => {
    loadStrategy(strategyId);
  }, [ strategyId ]);

  const [ selectedOperation, setSelectedOperation ] = useState<string | undefined>(undefined);
  const [ pageHistory, setPageHistory ] = useState<string[]>([]);

  const currentPage = pageHistory[pageHistory.length - 1];

  const onClickBack = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    const newPageHistory = pageHistory.slice(0, -1);
    if (newPageHistory.length === 0) {
      setSelectedOperation(undefined);
    }
    setPageHistory(pageHistory.slice(0, -1));
  }, [ pageHistory ]);

  const advanceToPage = useCallback((nextPage: string) => {
    setPageHistory([...pageHistory, nextPage]);
  }, [ pageHistory ]);

  const startOperationForm = useCallback((formType: string, initialPage: string) => {
    setSelectedOperation(formType);
    advanceToPage(initialPage);
  }, [ advanceToPage ]);

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
          stepsCompletedNumber === undefined ||
          operandStep === undefined ||
          questions === undefined ||
          recordClasses === undefined
        )
          ? <Loading />
          : <div className={cx('--Container')}>
              <h1 className={cx('--Header')}>
                Add a Step to your Strategy
              </h1>
              {
                !selectedOperation
                  ? (
                    <div className={cx('--MenusContainer')}>
                      <div className={cx('--MenusHeader')}>
                          So far, your search strategy has {stepsCompletedNumber} {stepsCompletedNumber === 1 ? 'step' : 'steps'}.
                          It found {operandStep.estimatedSize.toLocaleString()} {
                            operandStep.estimatedSize === 1 
                              ? inputRecordClass.displayName
                              : inputRecordClass.displayNamePlural
                            }. 
                          <br />
                          Gain data mining power by adding a step to your strategy.  You can...
                      </div>
                      <div className={cx('--MenuItemsContainer')}>
                        {
                          operationTypes
                            .map((operation, index) =>
                              <React.Fragment key={operation}>
                                <div className={cx('--MenuItem')}>
                                  <Plugin<AddStepOperationMenuProps>
                                    key={operation}
                                    context={{
                                      type: 'addStepOperationMenu',
                                      name: operation
                                    }}
                                    pluginProps={{
                                      strategy,
                                      inputRecordClass,
                                      startOperationForm,
                                      updateStrategy,
                                      addType,
                                      stepsCompletedNumber,
                                      operandStep,
                                      previousStep,
                                      questions,
                                      recordClasses,
                                      developmentMode
                                    }}
                                  />
                                </div>
                                {
                                  index < operationTypes.length - 1 &&
                                  <div className={cx('--MenuItemSeparator')}>
                                    <p>
                                      <em>-or-</em>
                                    </p>
                                    <div className={cx('--MenuItemDividingLine')}>
                                    </div>
                                  </div>
                                }
                              </React.Fragment>
                            )
                        }
                      </div>
                    </div>
                  )
                  : (
                    <div className={cx('--Form')}>
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
                          addType,
                          stepsCompletedNumber,
                          operandStep,
                          previousStep,
                          questions,
                          recordClasses
                        }}
                      />
                    </div>
                  )
              }
            </div>
      }
    </div>
  )
});

const globalData = ({ globalData }: RootState) => globalData;

const questions = createSelector(
  globalData,
  globalData => globalData.questions
);

const recordClasses = createSelector(
  globalData,
  globalData => globalData.recordClasses
);

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

const stepsCompletedNumber = createSelector(
  previousStepSubtree,
  previousStepSubtree => previousStepSubtree === undefined
    ? 1
    : findPrimaryBranchHeight(previousStepSubtree) + 1
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
    stepsCompletedNumber: stepsCompletedNumber(state, ownProps),
    previousStep: previousStep(state, ownProps),
    operandStep: operandStep(state, ownProps),
    questions: questions(state),
    recordClasses: recordClasses(state)
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
