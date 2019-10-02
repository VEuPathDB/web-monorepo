import React, { useEffect, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createSelector } from 'reselect';

import { updateActiveQuestion, updateParamValue } from 'wdk-client/Actions/QuestionActions';
import { requestCombineWithBasket } from 'wdk-client/Actions/StrategyActions';
import { Loading } from 'wdk-client/Components';
import { RootState } from 'wdk-client/Core/State/Types';
import WdkService from 'wdk-client/Service/WdkService';
import { QuestionState } from 'wdk-client/StoreModules/QuestionStoreModule';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { Parameter, RecordClass } from 'wdk-client/Utils/WdkModel';
import { StepTree } from 'wdk-client/Utils/WdkUser';
import { AddStepOperationMenuProps } from 'wdk-client/Views/Strategy/AddStepPanel';
import { PrimaryInputLabel } from 'wdk-client/Views/Strategy/PrimaryInputLabel';
import { SearchInputSelector } from 'wdk-client/Views/Strategy/SearchInputSelector';
import { cxStepBoxes as cxOperator } from 'wdk-client/Views/Strategy/ClassNames';
import { AddType } from 'wdk-client/Views/Strategy/Types';
import { combineOperatorOrder, BOOLEAN_OPERATOR_PARAM_NAME } from 'wdk-client/Views/Strategy/StrategyUtils';

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
    operandStep,
    onHideInsertStep,
    startCombiningWithBasket,
    strategy,
    addType
  }: Props
) => {
  useEffect(() => {
    loadBooleanQuestion(booleanSearchUrlSegment);
  }, [ booleanSearchUrlSegment ]);

  const onOperatorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateBooleanOperator(e.target.value);
  }, [ updateBooleanOperator ]);

  const onCombineWithStrategyClicked = useCallback((_: React.MouseEvent) => {
    startOperationForm('combine-with-strategy', 'main-page');
  }, []);

  const onCombineWithBasketClicked = useCallback((_: React.MouseEvent) => {
    if (basketSearchShortDisplayName && booleanSearchState) {
      onHideInsertStep();
      startCombiningWithBasket(
        strategy.strategyId,
        inputRecordClass.urlSegment,
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
    inputRecordClass.urlSegment, 
    basketSearchUrlSegment, 
    basketDatasetParamName ,
    basketSearchShortDisplayName,
    booleanSearchUrlSegment,
    booleanSearchState,
    addType
  ]);

  const onCombineWithNewSearchClicked = useCallback((newSearchUrlSegment: string) => {
    startOperationForm('combine-with-new-search', newSearchUrlSegment);
  }, [ startOperationForm ]);

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
          : (
            <div className={cx('--Container')}>
              <div className={cx('--Header')}>
                <h3>
                  Combine it
                </h3>
                  with another set of {inputRecordClass.displayNamePlural} from:
              </div>
              <div className={cx('--Body')}>
                <PrimaryInputLabel
                  resultSetSize={operandStep.estimatedSize}
                  recordClass={inputRecordClass}
                />
                <div className={cx('--OperatorSelector')}>
                  {
                    combineOperatorOrder.map(operator => (
                      <div key={operator} className={cx('--OperatorChoice')} >
                        <input
                          id={operator}
                          type="radio"
                          name="operator"
                          value={operator}
                          defaultChecked={operator === booleanSearchState.paramValues[BOOLEAN_OPERATOR_PARAM_NAME]}
                          onChange={onOperatorChange}
                        />
                        <label htmlFor={operator}>
                          <div className={cxOperator('--CombineOperator', operator)}>
                          </div>
                        </label>
                      </div>
                    ))
                  }
                </div>
                <SearchInputSelector
                  containerClassName={cx('--SecondaryInputSelector')}
                  onCombineWithBasketClicked={onCombineWithBasketClicked}
                  onCombineWithStrategyClicked={onCombineWithStrategyClicked}
                  onCombineWithNewSearchClicked={onCombineWithNewSearchClicked}
                  inputRecordClass={inputRecordClass}
                />
              </div>
            </div>
          )
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
          stepId: undefined
        })
      )
    },
    updateParamValue: compose(dispatch, updateParamValue),
    startCombiningWithBasket: compose(dispatch, requestCombineWithBasket)
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

const submitBasket = async (
  wdkService: WdkService,
  basketDatasetParamName: string,
  basketSearchShortDisplayName: string,
  basketSearchUrlSegment: string,
  booleanSearchState: QuestionState,
  booleanSearchUrlSegment: string,
  recordClass: RecordClass,
  updateStrategy: (newStepId: number, newSecondaryInput: StepTree) => void,
  onHideInsertStep: () => void,
  startCombiningWithBasket: DispatchProps['startCombiningWithBasket'],
  strategyId: number
) => {
  onHideInsertStep();

  const datasetId = await wdkService.createDataset({
    sourceType: 'basket',
    sourceContent: {
      basketName: recordClass.urlSegment
    }
  });

  const [{ id: basketStepId }, { id: booleanStepId }] = await Promise.all([
    wdkService.createStep({
      searchName: basketSearchUrlSegment,
      searchConfig: {
        parameters: {
          [basketDatasetParamName]: `${datasetId}`
        }
      },
      customName: basketSearchShortDisplayName
    }),
    wdkService.createStep({
      searchName: booleanSearchUrlSegment,
      searchConfig: {
        parameters: booleanSearchState.paramValues
      },
      customName: booleanSearchState.question.displayName
    })
  ]);

  updateStrategy(
    booleanStepId,
    {
      stepId: basketStepId,
      primaryInput: undefined,
      secondaryInput: undefined
    }
  );
};
