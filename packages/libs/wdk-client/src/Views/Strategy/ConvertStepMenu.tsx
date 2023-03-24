import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { Loading } from '../../Components';
import { RootState } from '../../Core/State/Types';
import { makeClassNameHelper } from '../../Utils/ComponentUtils';
import { Question, RecordClass } from '../../Utils/WdkModel';
import { AddStepOperationMenuProps } from '../../Views/Strategy/AddStepPanel';
import { inputResultSetDescription } from '../../Views/Strategy/AddStepUtils';

import '../../Views/Strategy/ConvertStepMenu.scss';

const cx = makeClassNameHelper('ConvertStepMenu');

type StateProps = {
  operatorChoices?: OperatorChoice[];
};

type OperatorChoice = { searchName: string; display: string };

type OwnProps = AddStepOperationMenuProps;

type Props = StateProps & OwnProps;

const ConvertStepMenuView = ({
  inputRecordClass,
  operandStep,
  operatorChoices,
  previousStep,
  startOperationForm,
}: Props) => (
  <div className={cx()}>
    {!operatorChoices ? (
      <Loading />
    ) : (
      <div className={cx('--Content')}>
        <h2>
          Transform{' '}
          {inputResultSetDescription(
            operandStep.estimatedSize,
            inputRecordClass
          )}{' '}
          into...
        </h2>
        <div className={cx('--OperatorSelector')}>
          {!previousStep || operatorChoices.length === 0 ? (
            'No conversions available.'
          ) : (
            <>
              {operatorChoices.map(({ searchName, display }) => (
                <button
                  key={searchName}
                  onClick={() => startOperationForm('convert', searchName)}
                >
                  {display}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    )}
  </div>
);

const outputStepQuestion = (
  _: RootState,
  { outputStep, questionsByUrlSegment }: OwnProps
) => outputStep && questionsByUrlSegment[outputStep.searchName];

// A search specifies a valid transform <=>
//   (1) the search has a primary input and NO secondary input
//   (2) the search's primary input is compatible with the input step's record class
//   (3) if inserting before a step (the "output step"), the search's output record class is compatible with the output step's primary input
//   (4) FIXME - ugly hardcoding - the search's outputRecordClassName is not "gene"
//   (5) FIXME - ugly hardcoding - the search's shortDisplayName is not "Weight"
export const isValidTransformFactory =
  (inputRecordClass: RecordClass, outputStepQuestion?: Question) =>
  (search: Question) =>
    // (1)
    !!search.allowedPrimaryInputRecordClassNames &&
    !search.allowedSecondaryInputRecordClassNames && // (2)
    search.allowedPrimaryInputRecordClassNames.includes(
      inputRecordClass.urlSegment
    ) && // (3)
    (!outputStepQuestion ||
      (!!outputStepQuestion.allowedPrimaryInputRecordClassNames &&
        outputStepQuestion.allowedPrimaryInputRecordClassNames.includes(
          search.outputRecordClassName
        ))) && // (4)
    search.outputRecordClassName !== 'gene' && // (5)
    search.shortDisplayName !== 'Weight';

const isValidTransform = createSelector(
  (_: RootState, { inputRecordClass }: OwnProps) => inputRecordClass,
  outputStepQuestion,
  isValidTransformFactory
);

const transformToOperatorChoiceFactory =
  (
    recordClassesByUrlSegment: Record<string, RecordClass>,
    inputRecordClass: RecordClass
  ) =>
  (transform: Question): OperatorChoice => {
    const outputRecordClass =
      recordClassesByUrlSegment[transform.outputRecordClassName];

    if (!outputRecordClass) {
      throw new Error(
        `Invalid record class with url segment '${transform.outputRecordClassName}' was encountered.`
      );
    }

    return {
      searchName: transform.urlSegment,
      display:
        inputRecordClass.urlSegment !== outputRecordClass.urlSegment
          ? outputRecordClass.displayNamePlural
          : transform.shortDisplayName,
    };
  };

const transformToOperatorChoice = createSelector(
  (_: RootState, { recordClassesByUrlSegment }: OwnProps) =>
    recordClassesByUrlSegment,
  (_: RootState, { inputRecordClass }: OwnProps) => inputRecordClass,
  (recordClassesByUrlSegment, inputRecordClass) =>
    transformToOperatorChoiceFactory(
      recordClassesByUrlSegment,
      inputRecordClass
    )
);

const operatorChoices = createSelector(
  (_: RootState, { questions }: OwnProps) => questions,
  isValidTransform,
  transformToOperatorChoice,
  (questions, isValidTransform, transformToOperatorChoice) =>
    questions &&
    transformToOperatorChoice &&
    questions.filter(isValidTransform).map(transformToOperatorChoice)
);

const mapStateToProps = (state: RootState, props: OwnProps): StateProps => ({
  operatorChoices: operatorChoices(state, props),
});

export const ConvertStepMenu = connect(mapStateToProps)(ConvertStepMenuView);
