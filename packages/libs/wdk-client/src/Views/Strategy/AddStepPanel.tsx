import React, { useState, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createSelector } from 'reselect';

import { reportSubmissionError } from '../../Actions/QuestionActions';
import {
  requestStrategy,
  requestPutStrategyStepTree,
} from '../../Actions/StrategyActions';
import {
  CommonModal as StrategyModal,
  Loading,
  HelpIcon,
} from '../../Components';
import DeferredDiv from '../../Components/Display/DeferredDiv';
import { RootState } from '../../Core/State/Types';
import { useSessionBackedState } from '../../Hooks/SessionBackedState';
import { makeClassNameHelper, wrappable } from '../../Utils/ComponentUtils';
import {
  useAddStepMenuConfigs,
  useSelectedAddStepFormComponent,
} from '../../Utils/Operations';
import {
  findPrimaryBranchHeight,
  addStep,
  getPreviousStep,
  findPrimaryBranchLeaf,
  findSubtree,
  getOutputStep,
  findNestedStrategyRoot,
} from '../../Utils/StrategyUtils';
import { RecordClass, Question } from '../../Utils/WdkModel';
import { StrategyDetails, StepTree, Step } from '../../Utils/WdkUser';
import { AddStepMenuSelection } from '../../Views/Strategy/AddStepMenuSelection';
import { ADD_STEP_BUTTON_VERBIAGE } from '../../Views/Strategy/StepBoxes';
import { AddType, PartialUiStepTree } from '../../Views/Strategy/Types';

import '../../Views/Strategy/AddStepPanel.scss';

const cx = makeClassNameHelper('AddStepPanel');

const SHOULD_SKIP_ADD_STEP_HELP_SESSION_KEY = 'should-skip-add-step-help';

type StateProps = {
  inputRecordClass?: RecordClass;
  stepsCompletedNumber?: number;
  previousStep?: Step;
  operandStep?: Step;
  outputStep?: Step;
  questions?: Question[];
  recordClasses?: RecordClass[];
};

type DispatchProps = {
  loadStrategy: (strategyId: number) => void;
  requestPutStrategyStepTree: (
    strategyId: number,
    newStepTree: StepTree
  ) => void;
  reportSubmissionError: typeof reportSubmissionError;
};

type OwnProps = {
  strategy: StrategyDetails;
  addType: AddType;
  onHideInsertStep: () => void;
  uiStepTree: PartialUiStepTree;
};

type Props = StateProps & DispatchProps & OwnProps;

export type AddStepOperationMenuProps = {
  strategy: StrategyDetails;
  inputRecordClass: RecordClass;
  startOperationForm: (formType: string, initialPage: string) => void;
  updateStrategy: (newStepId: number, newSecondaryInput: StepTree) => void;
  addType: AddType;
  stepsCompletedNumber: number;
  operandStep: Step;
  previousStep?: Step;
  outputStep?: Step;
  questions: Question[];
  questionsByUrlSegment: Record<string, Question>;
  recordClasses: RecordClass[];
  recordClassesByUrlSegment: Record<string, RecordClass>;
  onHideInsertStep: () => void;
  reportSubmissionError: typeof reportSubmissionError;
};

export type AddStepOperationFormProps = {
  strategy: StrategyDetails;
  inputRecordClass: RecordClass;
  currentPage: string;
  advanceToPage: (nextPage: string) => void;
  replacePage: (nextPage: string) => void;
  updateStrategy: (newStepId: number, newSecondaryInput: StepTree) => void;
  addType: AddType;
  stepsCompletedNumber: number;
  operandStep: Step;
  previousStep?: Step;
  outputStep?: Step;
  questions: Question[];
  questionsByUrlSegment: Record<string, Question>;
  recordClasses: RecordClass[];
  recordClassesByUrlSegment: Record<string, RecordClass>;
  onHideInsertStep: () => void;
  reportSubmissionError: typeof reportSubmissionError;
};

export const AddStepPanelView = wrappable(
  ({
    addType,
    reportSubmissionError,
    inputRecordClass,
    onHideInsertStep,
    operandStep,
    previousStep,
    outputStep,
    questions,
    recordClasses,
    requestPutStrategyStepTree,
    strategy,
    stepsCompletedNumber,
    uiStepTree,
  }: Props) => {
    const [shouldSkipAddStepHelp, setShouldSkipAddStepHelp] =
      useSessionBackedState<boolean>(
        false,
        SHOULD_SKIP_ADD_STEP_HELP_SESSION_KEY,
        encodeShouldSkipAddStepHelp,
        parseShouldSkipAddStepHelp
      );

    // FIXME: Change the initial state of selectedMenu once the orientation verbiage is ready
    const [selectedMenu, setSelectedMenu] =
      useState<string | undefined>('combine');
    const [selectedOperation, setSelectedOperation] = useState<
      string | undefined
    >(addType.selectedOperation);
    const [pageHistory, setPageHistory] = useState<string[]>(
      addType.pageHistory || []
    );

    const currentPage = pageHistory[pageHistory.length - 1];

    const onClickBack = useCallback(() => {
      const newPageHistory = pageHistory.slice(0, -1);

      if (newPageHistory.length === 0) {
        setSelectedOperation(undefined);
      }

      setPageHistory(newPageHistory);
    }, [pageHistory]);

    const startOperationMenu = useCallback((operationType: string) => {
      setShouldSkipAddStepHelp(true);
      setSelectedMenu(operationType);
    }, []);

    const advanceToPage = useCallback(
      (nextPage: string) => {
        setPageHistory([...pageHistory, nextPage]);
      },
      [pageHistory]
    );

    const replacePage = useCallback(
      (nextPage: string) => {
        setPageHistory([...pageHistory.slice(0, -1), nextPage]);
      },
      [pageHistory]
    );

    const startOperationForm = useCallback(
      (formType: string, initialPage: string) => {
        setSelectedOperation(formType);
        advanceToPage(initialPage);
      },
      [advanceToPage]
    );

    const updateStrategy = useCallback(
      (newStepId: number, newSecondaryInput: StepTree) => {
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
      },
      [strategy, requestPutStrategyStepTree, addType]
    );

    const questionsByUrlSegment = useMemo(
      () =>
        questions &&
        questions.reduce((memo, question) => {
          memo[question.urlSegment] = question;
          return memo;
        }, {} as Record<string, Question>),
      [questions]
    );

    const recordClassesByUrlSegment = useMemo(
      () =>
        recordClasses &&
        recordClasses.reduce((memo, recordClass) => {
          memo[recordClass.urlSegment] = recordClass;
          return memo;
        }, {} as Record<string, RecordClass>),
      [recordClasses]
    );

    const addStepMenuConfigs = useAddStepMenuConfigs(
      questionsByUrlSegment,
      recordClassesByUrlSegment,
      operandStep,
      previousStep,
      outputStep
    );

    const SelectedMenu = useMemo(
      () =>
        addStepMenuConfigs?.find(({ name }) => name === selectedMenu)
          ?.AddStepMenuComponent,
      [addStepMenuConfigs, selectedMenu]
    );

    const SelectedForm = useSelectedAddStepFormComponent(
      selectedOperation,
      questionsByUrlSegment,
      recordClassesByUrlSegment,
      operandStep,
      previousStep,
      outputStep
    );

    const nestedBranchStepTree = useMemo(
      () => findNestedStrategyRoot(uiStepTree, addType.stepId) || uiStepTree,
      [uiStepTree, addType.stepId]
    );

    return (
      <StrategyModal
        title={
          <div>
            Add a step to your search strategy
            <HelpIcon>{ADD_STEP_BUTTON_VERBIAGE}</HelpIcon>
          </div>
        }
        onGoBack={
          selectedOperation &&
          (addType.pageHistory === undefined ||
            pageHistory.length > addType.pageHistory.length)
            ? onClickBack
            : onHideInsertStep
        }
        onClose={onHideInsertStep}
      >
        <div className={cx()}>
          {strategy === undefined ||
          inputRecordClass === undefined ||
          stepsCompletedNumber === undefined ||
          operandStep === undefined ||
          questions === undefined ||
          questionsByUrlSegment === undefined ||
          recordClasses === undefined ||
          recordClassesByUrlSegment === undefined ||
          addStepMenuConfigs === undefined ? (
            <Loading />
          ) : (
            <div className={cx('--Container')}>
              <DeferredDiv
                className={cx('--MenuContainer')}
                visible={selectedOperation == null}
              >
                <div className={cx('--MenuSelector')}>
                  {addStepMenuConfigs.map(
                    ({
                      name: operationName,
                      AddStepHeaderComponent,
                      AddStepNewInputComponent,
                      AddStepNewOperationComponent,
                    }) => (
                      <AddStepMenuSelection
                        key={operationName}
                        uiStepTree={nestedBranchStepTree}
                        inputRecordClass={inputRecordClass}
                        isSelected={selectedMenu === operationName}
                        onSelectMenuItem={() => {
                          startOperationMenu(operationName);
                        }}
                        addType={addType}
                        AddStepHeaderComponent={AddStepHeaderComponent}
                        AddStepNewInputComponent={AddStepNewInputComponent}
                        AddStepNewOperationComponent={
                          AddStepNewOperationComponent
                        }
                      />
                    )
                  )}
                </div>
                <div className={cx('--SelectedMenuContainer')}>
                  {SelectedMenu == null ? (
                    <div className={cx('--Orientation')}>
                      <div>
                        Select an option on the left to consider more data for
                        your search strategy.
                      </div>
                    </div>
                  ) : (
                    <SelectedMenu
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
                      reportSubmissionError={reportSubmissionError}
                    />
                  )}
                </div>
              </DeferredDiv>
              {selectedOperation != null && (
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
                    reportSubmissionError={reportSubmissionError}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </StrategyModal>
    );
  }
);

const encodeShouldSkipAddStepHelp = (shouldSkipAddStepHelp: boolean) =>
  shouldSkipAddStepHelp ? 'y' : 'n';
const parseShouldSkipAddStepHelp = (shouldSkipAddStepHelpStr: string) =>
  shouldSkipAddStepHelpStr === 'y';

const globalData = ({ globalData }: RootState) => globalData;

const questions = createSelector(
  globalData,
  (globalData) => globalData.questions
);

const recordClasses = createSelector(
  globalData,
  (globalData) => globalData.recordClasses
);

const strategy = (_: RootState, { strategy }: OwnProps) => {
  return strategy;
};

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

    const insertionPointSubtree = findSubtree(
      strategy.stepTree,
      addType.stepId
    );

    return strategy.steps[
      findPrimaryBranchLeaf(insertionPointSubtree || strategy.stepTree).stepId
    ];
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
  (previousStepSubtree) =>
    previousStepSubtree === undefined
      ? 1
      : findPrimaryBranchHeight(previousStepSubtree) + 1
);

const inputRecordClass = createSelector(
  strategy,
  operandStep,
  ({ globalData: { recordClasses } }: RootState) => recordClasses,
  (_, { addType }) => addType,
  (strategy, operandStep, recordClasses, addType) => {
    if (
      strategy === undefined ||
      operandStep === undefined ||
      recordClasses === undefined
    ) {
      return undefined;
    }

    const inputRecordClassName =
      addType.type === 'insert-before'
        ? operandStep.recordClassName
        : strategy.steps[addType.stepId].recordClassName;

    return recordClasses.find(
      ({ urlSegment }) => urlSegment === inputRecordClassName
    );
  }
);

export const AddStepPanel = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  Props,
  RootState
>(
  (state, ownProps) => ({
    inputRecordClass: inputRecordClass(state, ownProps),
    strategy: strategy(state, ownProps),
    stepsCompletedNumber: stepsCompletedNumber(state, ownProps),
    previousStep: previousStep(state, ownProps),
    operandStep: operandStep(state, ownProps),
    outputStep: outputStep(state, ownProps),
    questions: questions(state),
    recordClasses: recordClasses(state),
  }),
  (dispatch) => ({
    loadStrategy: compose(dispatch, requestStrategy),
    requestPutStrategyStepTree: compose(dispatch, requestPutStrategyStepTree),
    reportSubmissionError: compose(dispatch, reportSubmissionError),
  }),
  (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
  })
)(AddStepPanelView);
