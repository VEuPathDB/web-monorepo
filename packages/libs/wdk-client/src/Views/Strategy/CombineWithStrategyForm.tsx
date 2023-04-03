import React, { useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createSelector } from 'reselect';

import { updateParamValue } from '../../Actions/QuestionActions';
import { Loading } from '../../Components';
import { RootState } from '../../Core/State/Types';
import { useWdkEffect } from '../../Service/WdkService';
import {
  QuestionState,
  DEFAULT_STRATEGY_NAME,
} from '../../StoreModules/QuestionStoreModule';
import { makeClassNameHelper } from '../../Utils/ComponentUtils';
import { Parameter } from '../../Utils/WdkModel';
import { AddStepOperationFormProps } from '../../Views/Strategy/AddStepPanel';
import { BooleanSelect } from '../../Views/Strategy/BooleanSelect';
import { StrategyInputSelector } from '../../Views/Strategy/StrategyInputSelector';
import {
  BOOLEAN_OPERATOR_PARAM_NAME,
  CombineOperator,
} from '../../Views/Strategy/StrategyUtils';

import '../../Views/Strategy/CombineWithStrategyForm.scss';

const cx = makeClassNameHelper('CombineWithStrategyForm');

type StateProps = {
  booleanSearchUrlSegment: string;
  booleanSearchState?: QuestionState;
  booleanOperatorParameter?: Parameter;
};

type DispatchProps = {
  updateParamValue: (payload: {
    searchName: string;
    parameter: Parameter;
    paramValues: Record<string, string>;
    paramValue: string;
  }) => void;
};

const recordClassSegment = createSelector(
  (_: RootState, { inputRecordClass }: OwnProps) => inputRecordClass,
  (recordClass) => recordClass && recordClass.fullName.replace('.', '_')
);

const booleanSearchUrlSegment = createSelector(
  recordClassSegment,
  (recordClassSegment) => `boolean_question_${recordClassSegment}`
);

const booleanSearchState = createSelector(
  ({ question: { questions } }: RootState) => questions,
  booleanSearchUrlSegment,
  (questions, booleanSearchUrlSegment) => questions[booleanSearchUrlSegment]
);

const booleanOperatorParameter = createSelector(
  booleanSearchState,
  (booleanSearchState) => {
    if (
      !booleanSearchState ||
      booleanSearchState.questionStatus === 'loading'
    ) {
      return undefined;
    }

    const booleanOperatorEntry =
      booleanSearchState.question.parametersByName[BOOLEAN_OPERATOR_PARAM_NAME];

    if (!booleanOperatorEntry) {
      return undefined;
    }

    return booleanOperatorEntry;
  }
);

type OwnProps = AddStepOperationFormProps;

type CombineStepFormViewProps = StateProps & {
  updateBooleanOperator: (newBooleanOperator: CombineOperator) => void;
} & OwnProps;

type SelectedStrategy = {
  id: number;
  name: string;
};

const CombineWithStrategyFormView = ({
  booleanSearchState,
  booleanSearchUrlSegment,
  addType,
  inputRecordClass,
  updateBooleanOperator,
  stepsCompletedNumber,
  strategy,
  updateStrategy,
  recordClassesByUrlSegment,
}: CombineStepFormViewProps) => {
  const [selectedStrategy, setSelectedStrategy] =
    useState<SelectedStrategy | undefined>(undefined);

  const onStrategySelected = useCallback(
    (strategyId: number, strategyName: string) => {
      setSelectedStrategy({
        id: strategyId,
        name: strategyName || DEFAULT_STRATEGY_NAME,
      });
    },
    []
  );

  useWdkEffect(
    (wdkService) => {
      if (
        selectedStrategy !== undefined &&
        booleanSearchState &&
        booleanSearchState.paramValues
      ) {
        const operatorStepPromise = wdkService.createStep({
          searchName: booleanSearchUrlSegment,
          searchConfig: {
            parameters: booleanSearchState.paramValues,
          },
          customName: booleanSearchState.question.displayName,
          expandedName: `Copy of ${selectedStrategy.name}`,
        });

        const duplicateStepTreePromise =
          wdkService.getDuplicatedStrategyStepTree(selectedStrategy.id);

        Promise.all([operatorStepPromise, duplicateStepTreePromise]).then(
          ([{ id: operatorStepId }, duplicateStepTree]) => {
            updateStrategy(operatorStepId, duplicateStepTree);
          }
        );
      }
    },
    [selectedStrategy]
  );

  return !booleanSearchState ||
    booleanSearchState.questionStatus === 'loading' ? (
    <Loading />
  ) : (
    <div className={cx()}>
      <div className={cx('--Header')}>
        <h2>
          Choose an existing {inputRecordClass.displayNamePlural} strategy
        </h2>

        <div className={cx('--BooleanOperatorMenu')}>
          The results will be{' '}
          <BooleanSelect
            value={
              booleanSearchState &&
              (booleanSearchState.paramValues[
                BOOLEAN_OPERATOR_PARAM_NAME
              ] as CombineOperator)
            }
            onChange={updateBooleanOperator}
            addType={addType}
          />{' '}
          the results of Step {stepsCompletedNumber}.
        </div>
      </div>
      <div className={cx('--Body')}>
        {selectedStrategy !== undefined ? (
          <Loading />
        ) : (
          <StrategyInputSelector
            onStrategySelected={onStrategySelected}
            primaryInput={strategy}
            secondaryInputRecordClasses={[inputRecordClass]}
            recordClassesByUrlSegment={recordClassesByUrlSegment}
          />
        )}
      </div>
    </div>
  );
};

export const CombineWithStrategyForm = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  CombineStepFormViewProps,
  RootState
>(
  (state, ownProps) => ({
    booleanSearchUrlSegment: booleanSearchUrlSegment(state, ownProps),
    booleanSearchState: booleanSearchState(state, ownProps),
    booleanOperatorParameter: booleanOperatorParameter(state, ownProps),
  }),
  (dispatch) => ({
    updateParamValue: compose(dispatch, updateParamValue),
  }),
  (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    updateBooleanOperator: (newBooleanOperator: CombineOperator) => {
      if (
        stateProps.booleanSearchState &&
        stateProps.booleanOperatorParameter
      ) {
        dispatchProps.updateParamValue({
          searchName: stateProps.booleanSearchUrlSegment,
          parameter: stateProps.booleanOperatorParameter,
          paramValues: stateProps.booleanSearchState.paramValues,
          paramValue: newBooleanOperator,
        });
      }
    },
    ...ownProps,
  })
)(CombineWithStrategyFormView);
