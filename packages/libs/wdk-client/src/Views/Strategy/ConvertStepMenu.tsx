import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { Loading } from 'wdk-client/Components';
import { RootState } from 'wdk-client/Core/State/Types';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { Question, RecordClass } from 'wdk-client/Utils/WdkModel';
import { Step } from 'wdk-client/Utils/WdkUser';
import { AddStepOperationMenuProps } from 'wdk-client/Views/Strategy/AddStepPanel'

import 'wdk-client/Views/Strategy/ConvertStepMenu.scss';
import { findAppendPoint } from 'wdk-client/Utils/StrategyUtils';
import { PrimaryInputLabel } from './PrimaryInputLabel';

const cx = makeClassNameHelper('ConvertStepMenu');

type StateProps = {
  operatorChoices?: OperatorChoice[];
};

type OperatorChoice = { searchName: string, display: string };

type OwnProps = AddStepOperationMenuProps;

type Props = StateProps & OwnProps;

const ConvertStepMenuView = ({
  inputRecordClass,
  operandStep,
  operatorChoices,
  previousStep,
  startOperationForm
}: Props) => (
  <div className={cx()}>
    {
      !operatorChoices
        ? <Loading />
        : (
          <div className={cx('--Container')}>
            <div className={cx('--Header')}>
              <h3>
                Convert it
              </h3>
                into a related set of:
            </div>
            <div className={cx('--Body')}>
              <PrimaryInputLabel
                className={cx('--PrimaryInputLabel')}
                resultSetSize={operandStep.estimatedSize}
                recordClass={inputRecordClass}
              />
              <div className={cx('--TransformIcon')}>
                >
              </div>

              <div className={cx('--OperatorSelector')}>
                {
                  !previousStep || operatorChoices.length === 0
                    ? "No conversions available."
                    : (
                      <>
                        {
                          operatorChoices.map(({ searchName, display }) =>
                            <button key={searchName} onClick={() => startOperationForm('convert', searchName)}>
                              {display}
                            </button>
                          )
                        }
                      </>
                    )
                }  
              </div>
            </div>
          </div>
        )
    }
  </div>
);

const outputStep = createSelector(
  (_: RootState, { addType }: OwnProps) => addType,
  (_: RootState, { strategy }: OwnProps) => strategy,
  (addType, strategy) => addType.type === 'append' && strategy.stepTree.stepId === addType.primaryInputStepId
    ? undefined
    : addType.type === 'append'
    ? strategy.steps[findAppendPoint(strategy.stepTree, addType.primaryInputStepId).stepId]
    : strategy.steps[addType.outputStepId]
);

const outputStepQuestion = createSelector(
  outputStep,
  ({ globalData: { questions } }: RootState) => questions,
  (outputStep, questions) => outputStep && questions && questions.find(({ urlSegment }) => urlSegment === outputStep.searchName)
);

// A search specifies a valid transform <=>
//   (1) the search has a primary input and NO secondary input
//   (2) the search's primary input is compatible with the input step's record class
//   (3) if inserting before a step (the "output step"), the search's output record class is compatible with the output step's primary input
//   (4) the search has at least one visible parameter group
const isValidTransformFactory = (inputRecordClass: RecordClass, outputStepQuestion?: Question) => (search: Question) =>
  ( // (1)
    !!search.allowedPrimaryInputRecordClassNames && !search.allowedSecondaryInputRecordClassNames
  ) &&
  ( // (2)
    search.allowedPrimaryInputRecordClassNames.includes(inputRecordClass.urlSegment)
  ) &&
  ( // (3)
    !outputStepQuestion || 
    outputStepQuestion.allowedPrimaryInputRecordClassNames && outputStepQuestion.allowedPrimaryInputRecordClassNames.includes(search.outputRecordClassName)
  ) &&
  ( // (4)
    search.groups.some(group => group.isVisible)
  );

const isValidTransform = createSelector(
  (_: RootState, { inputRecordClass }: OwnProps) => inputRecordClass,
  outputStepQuestion,
  isValidTransformFactory
);

const transformToOperatorChoiceFactory = (recordClasses: RecordClass[], inputRecordClass: RecordClass) => (transform: Question): OperatorChoice => {
  const outputRecordClass = recordClasses.find(({ urlSegment }) => urlSegment === transform.outputRecordClassName);

  if (!outputRecordClass) {
    throw new Error(`Invalid record class with url segment '${transform.outputRecordClassName}' was encountered.`);
  }

  return {
    searchName: transform.urlSegment,
    display: inputRecordClass.urlSegment !== outputRecordClass.urlSegment
      ? outputRecordClass.shortDisplayNamePlural
      : `${inputRecordClass.shortDisplayNamePlural} (by ${transform.shortDisplayName})`
  };
};

const transformToOperatorChoice = createSelector(
  (_: RootState, { recordClasses }: OwnProps) => recordClasses,
  (_: RootState, { inputRecordClass }: OwnProps) => inputRecordClass,
  (recordClasses, inputRecordClass) => recordClasses && transformToOperatorChoiceFactory(recordClasses, inputRecordClass)
);

const operatorChoices = createSelector(
  (_: RootState, { questions }: OwnProps) => questions,
  isValidTransform,
  transformToOperatorChoice,
  (questions, isValidTransform, transformToOperatorChoice) => 
    questions && 
    transformToOperatorChoice &&
    questions
      .filter(isValidTransform)
      .map(transformToOperatorChoice)
);

const mapStateToProps = (state: RootState, props: OwnProps): StateProps => ({
  operatorChoices: operatorChoices(state, props)
});

export const ConvertStepMenu = connect(mapStateToProps)(ConvertStepMenuView);
