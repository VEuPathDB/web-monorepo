import React, { useEffect, useCallback, useMemo, ReactNode } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createSelector } from 'reselect';

import { updateActiveQuestion, updateParamValue } from 'wdk-client/Actions/QuestionActions';
import { requestCombineWithBasket, requestCombineWithStrategy } from 'wdk-client/Actions/StrategyActions';
import { Loading } from 'wdk-client/Components';
import { RootState } from 'wdk-client/Core/State/Types';
import { QuestionState, DEFAULT_STRATEGY_NAME } from 'wdk-client/StoreModules/QuestionStoreModule';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { Parameter } from 'wdk-client/Utils/WdkModel';
import { AddStepOperationMenuProps } from 'wdk-client/Views/Strategy/AddStepPanel';
import { MenuChoicesContainer, MenuChoice } from 'wdk-client/Views/Strategy/AddStepUtils';
import { cxStepBoxes as cxOperator } from 'wdk-client/Views/Strategy/ClassNames';
import { SearchInputSelector } from 'wdk-client/Views/Strategy/SearchInputSelector';
import { AddType } from 'wdk-client/Views/Strategy/Types';
import { BOOLEAN_OPERATOR_PARAM_NAME, CombineOperator, combineOperatorOrder } from 'wdk-client/Views/Strategy/StrategyUtils';

import 'wdk-client/Views/Strategy/CombineStepMenu.scss';

const cx = makeClassNameHelper('CombineStepMenu');

type StateProps = {
  basketSearchUrlSegment: string,
  basketDatasetParamName: string,
  basketSearchShortDisplayName?: string,
  booleanSearchUrlSegment: string,
  booleanSearchState?: QuestionState,
  booleanOperatorParameter?: Parameter
};

function combineOperatorOptionDisplay(operator: CombineOperator, stepALabel: ReactNode, stepBLabel: ReactNode) {
  return operator === CombineOperator.Intersect
    ? <React.Fragment>{stepALabel} INTERSECT {stepBLabel}</React.Fragment>
    : operator === CombineOperator.Union
    ? <React.Fragment>{stepALabel} UNION {stepBLabel}</React.Fragment>
    : operator === CombineOperator.LeftMinus
    ? <React.Fragment>{stepALabel} MINUS {stepBLabel}</React.Fragment>
    : <React.Fragment>{stepBLabel} MINUS {stepALabel}</React.Fragment>;
}


const recordClassSegment = createSelector(
  (_: RootState, { inputRecordClass }: OwnProps) => inputRecordClass,
  recordClass => recordClass && recordClass.fullName.replace('.', '_')
);

const basketSearchUrlSegment = createSelector(
  recordClassSegment,
  recordClassSegment => `${recordClassSegment}BySnapshotBasket`
);

const basketSearchShortDisplayName = createSelector(
  basketSearchUrlSegment,
  (_: RootState, { questionsByUrlSegment }: OwnProps) => questionsByUrlSegment,
  (basketSearchUrlSegment, questionsByUrlSegment) => {
    const basketSearchQuestion = questionsByUrlSegment[basketSearchUrlSegment];
    return basketSearchQuestion && basketSearchQuestion.shortDisplayName;
  }
);

const basketDatasetParamName = createSelector(
  recordClassSegment,
  recordClassSegment => `${recordClassSegment}Dataset`
);

const booleanSearchUrlSegment = createSelector(
  recordClassSegment,
  recordClassSegment => `boolean_question_${recordClassSegment}`
);

const booleanSearchState = createSelector(
  ({ question: { questions } }: RootState) => questions,
  booleanSearchUrlSegment,
  (questions, booleanSearchUrlSegment) => {
    const booleanSearchStateEntry = questions[booleanSearchUrlSegment];

    // FIXME Should the default question state be something other than an empty object?
    return !booleanSearchStateEntry || Object.keys(booleanSearchStateEntry).length === 0
      ? undefined
      : booleanSearchStateEntry;
  }
);

const booleanOperatorParameter = createSelector(
  booleanSearchState,
  booleanSearchState => {
    if (!booleanSearchState || booleanSearchState.questionStatus === 'loading') {
      return undefined;
    }

    const booleanOperatorEntry = booleanSearchState.question.parametersByName[BOOLEAN_OPERATOR_PARAM_NAME];

    if (!booleanOperatorEntry) {
      return undefined;
    }

    return booleanOperatorEntry;
  }
);

type DispatchProps = {
  loadBooleanQuestion: (
    booleanSearchUrlSegment: string,
  ) => void,
  updateParamValue: (payload: {
    searchName: string,
    parameter: Parameter,
    paramValues: Record<string, string>,
    paramValue: string
  }) => void,
  startCombiningWithBasket: (
    strategyId: number,
    basketRecordClass: string,
    basketSearchUrlSegment: string,
    basketDatasetParamName: string,
    basketSearchDisplayName: string,
    booleanSearchUrlSegment: string,
    booleanSearchParamValues: Record<string, string>,
    booleanSearchDisplayName: string,
    addType: AddType
  ) => void,
  startCombiningWithStrategy: (
    strategyId: number,
    secondaryInputStrategyId: number,
    secondaryInputName: string,
    booleanSearchUrlSegment: string,
    booleanSearchParamValues: Record<string, string>,
    booleanSearchDisplayName: string,
    addType: AddType
  ) => void
};

type MergedProps = {
  updateBooleanOperator: (newBooleanOperator: string) => void
};

type OwnProps = AddStepOperationMenuProps;

type Props = StateProps & DispatchProps & MergedProps & OwnProps;

export const CombineStepMenuView = (
  {
    basketSearchUrlSegment,
    basketSearchShortDisplayName,
    basketDatasetParamName,
    booleanSearchUrlSegment,
    booleanSearchState,
    booleanOperatorParameter,
    loadBooleanQuestion,
    inputRecordClass,
    updateBooleanOperator,
    startOperationForm,
    onHideInsertStep,
    startCombiningWithBasket,
    startCombiningWithStrategy,
    strategy,
    addType,
    recordClassesByUrlSegment,
    stepsCompletedNumber
  }: Props
) => {
  useEffect(() => {
    loadBooleanQuestion(booleanSearchUrlSegment);
  }, [ booleanSearchUrlSegment ]);

  const onOperatorSelect = useCallback((operator: CombineOperator) => {
    updateBooleanOperator(operator);
  }, [ updateBooleanOperator ]);

  const onCombineWithStrategySelected = useCallback(
    (secondaryInputStrategyId: number, secondaryInputName: string) => {
      if (booleanSearchState) {
        onHideInsertStep();
        startCombiningWithStrategy(
          strategy.strategyId,
          secondaryInputStrategyId,
          secondaryInputName || DEFAULT_STRATEGY_NAME,
          booleanSearchUrlSegment,
          booleanSearchState.paramValues,
          booleanSearchState.question.displayName,
          addType
        );
      }
    },
    [
      onHideInsertStep,
      startCombiningWithBasket,
      strategy.strategyId,
      booleanSearchUrlSegment,
      booleanSearchState,
      addType
    ]
  );

  const onCombineWithBasketSelected = useCallback(
    (recordClassUrlSegment: string) => {
      if (basketSearchShortDisplayName && booleanSearchState) {
        onHideInsertStep();
        startCombiningWithBasket(
          strategy.strategyId,
          recordClassUrlSegment,
          basketSearchUrlSegment,
          basketDatasetParamName,
          basketSearchShortDisplayName,
          booleanSearchUrlSegment,
          booleanSearchState.paramValues,
          booleanSearchState.question.displayName,
          addType
        );
      }
    },
    [
      onHideInsertStep,
      startCombiningWithBasket,
      strategy.strategyId,
      basketSearchUrlSegment,
      basketDatasetParamName,
      basketSearchShortDisplayName,
      booleanSearchUrlSegment,
      booleanSearchState,
      addType
    ]
  );

  const onCombineWithNewSearchSelected = useCallback((newSearchUrlSegment: string) => {
    startOperationForm('combine-with-new-search', newSearchUrlSegment);
  }, [ startOperationForm ]);

  const inputRecordClasses = useMemo(
    () => [ inputRecordClass ],
    [ inputRecordClass ]
  );

  return (
    <div className={cx()}>
      {
        (
          !basketSearchShortDisplayName ||
          !booleanSearchState ||
          booleanSearchState.questionStatus === 'loading' ||
          !booleanOperatorParameter
        )
          ? <Loading />
          : <MenuChoicesContainer containerClassName={cx('--Container')}>
              <MenuChoice>
                <strong>Choose <em>how</em> to combine with other {inputRecordClass.displayNamePlural}</strong>
                <div className={cx('--OperatorSelector')}>
                  {
                    combineOperatorOrder.map(operator => (
                      <div
                        key={operator}
                        className={cx(
                          '--OperatorChoice',
                          operator === booleanSearchState.paramValues[BOOLEAN_OPERATOR_PARAM_NAME] && 'selected'
                        )}
                      >
                        <input
                          id={operator}
                          type="radio"
                          name="add-step__operator-choice"
                          value={operator}
                          checked={operator === booleanSearchState.paramValues[BOOLEAN_OPERATOR_PARAM_NAME]}
                          onChange={() => {
                            onOperatorSelect(operator);
                          }}
                        />
                        <label htmlFor={operator} onClick={() => {
                          onOperatorSelect(operator);
                        }}>
                          <div className={cxOperator('--CombineOperator', operator)}>
                          </div>
                          <span>
                            {combineOperatorOptionDisplay(
                              operator,
                              stepsCompletedNumber,
                              stepsCompletedNumber + 1
                            )}
                          </span>
                        </label>
                      </div>
                    ))
                  }
                </div>
              </MenuChoice>
              <MenuChoice>
                <strong>Choose <em>which</em> {inputRecordClass.displayNamePlural} to combine.  From...</strong>
                <SearchInputSelector
                  strategy={strategy}
                  onCombineWithBasketSelected={onCombineWithBasketSelected}
                  onCombineWithNewSearchSelected={onCombineWithNewSearchSelected}
                  onCombineWithStrategySelected={onCombineWithStrategySelected}
                  inputRecordClasses={inputRecordClasses}
                  selectBasketButtonText={`Combine Step ${stepsCompletedNumber}`}
                  recordClassesByUrlSegment={recordClassesByUrlSegment}
                />
              </MenuChoice>
            </MenuChoicesContainer>
      }
    </div>
  );
};

export const CombineStepMenu = connect<StateProps, DispatchProps, OwnProps, Props, RootState>(
  (state, ownProps) => ({
    basketSearchUrlSegment: basketSearchUrlSegment(state, ownProps),
    basketDatasetParamName: basketDatasetParamName(state, ownProps),
    basketSearchShortDisplayName: basketSearchShortDisplayName(state, ownProps),
    booleanSearchUrlSegment: booleanSearchUrlSegment(state, ownProps),
    booleanSearchState: booleanSearchState(state, ownProps),
    booleanOperatorParameter: booleanOperatorParameter(state, ownProps)
  }),
  dispatch => ({
    loadBooleanQuestion: (booleanSearchUrlSegment: string) => {
      dispatch(
        updateActiveQuestion({
          searchName: booleanSearchUrlSegment,
          autoRun: false,
          prepopulateWithLastParamValues: false,
          stepId: undefined
        })
      )
    },
    updateParamValue: compose(dispatch, updateParamValue),
    startCombiningWithBasket: compose(dispatch, requestCombineWithBasket),
    startCombiningWithStrategy: compose(dispatch, requestCombineWithStrategy)
  }),
  (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    ...dispatchProps,
    updateBooleanOperator: (newBooleanOperator: string) => {
      if (stateProps.booleanSearchState && stateProps.booleanOperatorParameter) {
        dispatchProps.updateParamValue({
          searchName: stateProps.booleanSearchUrlSegment,
          parameter: stateProps.booleanOperatorParameter,
          paramValues: stateProps.booleanSearchState.paramValues,
          paramValue: newBooleanOperator
        });
      }
    },
    ...ownProps
  })
)(CombineStepMenuView);
