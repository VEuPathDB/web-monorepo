import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createSelector } from 'reselect';

import { requestStrategy, requestPutStrategyStepTree } from 'wdk-client/Actions/StrategyActions';
import { Loading } from 'wdk-client/Components';
import { RootState } from 'wdk-client/Core/State/Types';
import { makeClassNameHelper, wrappable } from 'wdk-client/Utils/ComponentUtils';
import { useAddStepMenuConfigs, useSelectedAddStepFormComponent } from 'wdk-client/Utils/Operations';
import { findPrimaryBranchHeight, addStep, getPreviousStep, findPrimaryBranchLeaf, findSubtree, getOutputStep } from 'wdk-client/Utils/StrategyUtils';
import { RecordClass, Question } from 'wdk-client/Utils/WdkModel';
import { StrategyDetails, StepTree, Step } from 'wdk-client/Utils/WdkUser';
import { AddType } from 'wdk-client/Views/Strategy/Types';

import 'wdk-client/Views/Strategy/AddStepPanel.scss';

const cx = makeClassNameHelper('AddStepPanel');

type StateProps = {
  strategy?: StrategyDetails,
  inputRecordClass?: RecordClass,
  stepsCompletedNumber?: number,
  previousStep?: Step,
  operandStep?: Step,
  outputStep?: Step,
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
  onHideInsertStep: () => void
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
  outputStep?: Step,
  questions: Question[],
  questionsByUrlSegment: Record<string, Question>,
  recordClasses: RecordClass[],
  recordClassesByUrlSegment: Record<string, RecordClass>,
  onHideInsertStep: () => void
};

export type AddStepOperationFormProps = {
  strategy: StrategyDetails,
  inputRecordClass: RecordClass,
  currentPage: string,
  advanceToPage: (nextPage: string) => void,
  replacePage: (nextPage: string) => void,
  updateStrategy: (newStepId: number, newSecondaryInput: StepTree) => void,
  addType: AddType,
  stepsCompletedNumber: number,
  operandStep: Step,
  previousStep?: Step,
  outputStep?: Step,
  questions: Question[],
  questionsByUrlSegment: Record<string, Question>,
  recordClasses: RecordClass[],
  recordClassesByUrlSegment: Record<string, RecordClass>,
  onHideInsertStep: () => void
};

export const AddStepPanelView = wrappable((
  {
    addType,
    loadStrategy,
    inputRecordClass,
    onHideInsertStep,
    operandStep,
    previousStep,
    outputStep,
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

    setPageHistory(newPageHistory);
  }, [ pageHistory ]);

  const advanceToPage = useCallback((nextPage: string) => {
    setPageHistory([...pageHistory, nextPage]);
  }, [ pageHistory ]);

  const replacePage = useCallback((nextPage: string) => {
    setPageHistory([...pageHistory.slice(0, -1), nextPage]);
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

  const questionsByUrlSegment = useMemo(
    () => questions && questions.reduce((memo, question) => {
      memo[question.urlSegment] = question;
      return memo;
    }, {} as Record<string, Question>),
    [ questions ]
  );

  const recordClassesByUrlSegment = useMemo(
    () => recordClasses && recordClasses.reduce((memo, recordClass) => {
      memo[recordClass.urlSegment] = recordClass;
      return memo;
    }, {} as Record<string, RecordClass>),
    [ recordClasses ]
  );

  const addStepMenuConfigs = useAddStepMenuConfigs(questionsByUrlSegment, recordClassesByUrlSegment, operandStep, previousStep, outputStep);
  const SelectedForm = useSelectedAddStepFormComponent(selectedOperation);

  return (
    <div className={cx()}>
      {
        (
          strategy === undefined ||
          inputRecordClass === undefined ||
          stepsCompletedNumber === undefined ||
          operandStep === undefined ||
          questions === undefined ||
          questionsByUrlSegment === undefined ||
          recordClasses === undefined ||
          recordClassesByUrlSegment === undefined ||
          addStepMenuConfigs === undefined
        )
          ? <Loading />
          : <div className={cx('--Container')}>
              <h1 className={cx('--Header')}>
                <button 
                  type="button" 
                  className="link" 
                  onClick={selectedOperation ? onClickBack : onHideInsertStep} 
                  title="Go Back">
                  <i className="fa fa-lg fa-arrow-left" />
                </button>
                <div>
                  Add a Step to your Strategy
                </div>
                <button type="button" className="link" onClick={onHideInsertStep} title="Close">
                  <i className="fa fa-lg fa-times" />
                </button>
              </h1>
              {
                !selectedOperation
                  ? (
                    <div className={cx('--MenusContainer')}>
                      <div className={cx('--MenusHeader')}>
                          So far, your search strategy has {stepsCompletedNumber} {stepsCompletedNumber === 1 ? 'step' : 'steps'}
                          {' '}
                          and finds {operandStep.estimatedSize === undefined ? '?' : operandStep.estimatedSize.toLocaleString()} {
                            operandStep.estimatedSize === 1
                              ? inputRecordClass.displayName
                              : inputRecordClass.displayNamePlural
                            }.
                          <br />
                          Gain data mining power by adding a step to your strategy.  You can...
                      </div>
                      <div className={cx('--MenuItemsContainer')}>
                        {
                          addStepMenuConfigs
                            .map(({ name: operation, AddStepMenuComponent }, index) =>
                              <React.Fragment key={operation}>
                                <div className={cx('--MenuItem')}>
                                  <AddStepMenuComponent
                                    strategy={strategy}
                                    inputRecordClass={inputRecordClass}
                                    startOperationForm={startOperationForm}
                                    updateStrategy={updateStrategy}
                                    addType={addType}
                                    stepsCompletedNumber={stepsCompletedNumber}
                                    operandStep={operandStep}
                                    previousStep={previousStep}
                                    outputStep={outputStep}
                                    questions={questions}
                                    questionsByUrlSegment={questionsByUrlSegment}
                                    recordClasses={recordClasses}
                                    recordClassesByUrlSegment={recordClassesByUrlSegment}
                                    onHideInsertStep={onHideInsertStep}
                                  />
                                </div>
                                {
                                  index < addStepMenuConfigs.length - 1 &&
                                  <div className={cx('--MenuItemSeparator')}>
                                    <em>-or-</em>
                                    <div className={cx('--MenuItemDividingLine')}></div>
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
                      <SelectedForm
                        strategy={strategy}
                        inputRecordClass={inputRecordClass}
                        currentPage={currentPage}
                        advanceToPage={advanceToPage}
                        replacePage={replacePage}
                        updateStrategy={updateStrategy}
                        addType={addType}
                        stepsCompletedNumber={stepsCompletedNumber}
                        operandStep={operandStep}
                        previousStep={previousStep}
                        outputStep={outputStep}
                        questions={questions}
                        questionsByUrlSegment={questionsByUrlSegment}
                        recordClasses={recordClasses}
                        recordClassesByUrlSegment={recordClassesByUrlSegment}
                        onHideInsertStep={onHideInsertStep}
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
    return strategyEntry && strategyEntry.strategy;
  }
);

const previousStepSubtree = createSelector(
  strategy,
  (_: RootState, { addType }) => addType,
  (strategy, addType) => strategy && getPreviousStep(strategy.stepTree, addType)
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
  (_, { addType }: OwnProps) => addType,
  (strategy, previousStep, addType) => {
    if (strategy === undefined) {
      return undefined;
    }

    if (previousStep !== undefined) {
      return previousStep;
    }

    const insertionPointSubtree = addType.type === 'append'
      ? findSubtree(strategy.stepTree, addType.primaryInputStepId)
      : findSubtree(strategy.stepTree, addType.outputStepId);

    return strategy.steps[findPrimaryBranchLeaf(insertionPointSubtree || strategy.stepTree).stepId];
  }
);

const outputStep = createSelector(
  (_: RootState, { addType }: OwnProps) => addType,
  strategy,
  (addType, strategy) => {
    if (!strategy) {
      return undefined;
    }

    const outputStep = getOutputStep(strategy.stepTree, addType);

    return outputStep && strategy.steps[outputStep.stepId];
  }
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
    outputStep: outputStep(state, ownProps),
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
