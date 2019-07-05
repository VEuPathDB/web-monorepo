import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createSelector } from 'reselect';

import { updateActiveQuestion, updateParamValue } from 'wdk-client/Actions/QuestionActions';
import { requestPutStrategyStepTree } from 'wdk-client/Actions/StrategyActions';
import { Loading } from 'wdk-client/Components';
import { RootState } from 'wdk-client/Core/State/Types';
import WdkService, { useWdkEffect } from 'wdk-client/Service/WdkService';
import { QuestionState } from 'wdk-client/StoreModules/QuestionStoreModule';
import { Question, Parameter, RecordClass } from 'wdk-client/Utils/WdkModel';
import { StepTree } from 'wdk-client/Utils/WdkUser';
import { AddStepOperationMenuProps } from 'wdk-client/Views/Strategy/AddStepPanel';

const BOOLEAN_OPERATOR_PARAM_NAME = 'bq_operator';

type StateProps = {
  basketSearchUrlSegment: string,
  basketDatasetParamName: string,
  basketSearchState?: QuestionState,
  booleanSearchUrlSegment: string,
  booleanLeftOperandParamName: string,
  booleanRightOperandParamName: string,
  booleanSearchState?: QuestionState,
  booleanOperatorParameter?: Parameter
};

const recordClassSegment = createSelector(
  (_: RootState, { recordClass }: OwnProps) => recordClass,
  recordClass => recordClass && recordClass.fullName.replace('.', '_')
);

const basketSearchUrlSegment = createSelector(
  recordClassSegment,
  (recordClassSegment: string) => `${recordClassSegment}BySnapshotBasket`
);

const basketDatasetParamName = createSelector(
  recordClassSegment,
  (recordClassSegment: string) => `${recordClassSegment}Dataset`
);

const basketSearchState = createSelector(
  ({ question: { questions } }: RootState) => questions,
  basketSearchUrlSegment,
  (questions, basketSearchUrlSegment) => questions[basketSearchUrlSegment]
);

const booleanSearchUrlSegment = createSelector(
  recordClassSegment,
  (recordClassSegment: string) => `boolean_question_${recordClassSegment}`
);

const booleanSearchState = createSelector(
  ({ question: { questions } }: RootState) => questions,
  booleanSearchUrlSegment,
  (questions, booleanSearchUrlSegment) => questions[booleanSearchUrlSegment]
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

const booleanLeftOperandParamName = createSelector(
  recordClassSegment,
  (recordClassSegment: string) => `bq_left_op_${recordClassSegment}`
);

const booleanRightOperandParamName = createSelector(
  recordClassSegment,
  (recordClassSegment: string) => `bq_right_op_${recordClassSegment}`
);

type DispatchProps = {
  loadBasketQuestion: (basketSearchUrlSegment: string) => void,
  loadBooleanQuestion: (
    booleanSearchUrlSegment: string,
    booleanLeftOperandParamName: string,
    booleanRightOperandParamName: string
  ) => void,
  updateParamValue: (
    searchName: string,
    parameter: Parameter, 
    paramValues: Record<string, string>, 
    paramValue: string
  ) => void
};

type MergedProps = {
  updateBooleanOperator: (newBooleanOperator: string) => void
};

type OwnProps = AddStepOperationMenuProps;

type Props = StateProps & DispatchProps & MergedProps & OwnProps;

type BasketButtonStatus = 'unclicked' | 'clicked' | 'loading';

export const CombineStepMenuView = (
  {
    basketSearchUrlSegment,
    basketDatasetParamName,
    basketSearchState,
    booleanSearchUrlSegment,
    booleanSearchState,
    booleanLeftOperandParamName,
    booleanRightOperandParamName,
    booleanOperatorParameter,
    loadBasketQuestion,
    loadBooleanQuestion,
    recordClass,
    updateStrategy
  }: Props
) => {
  const [ basketButtonStatus, setBasketButtonStatus ] = useState<BasketButtonStatus>('unclicked');

  useEffect(() => {
    loadBasketQuestion(basketSearchUrlSegment);
  }, [ basketSearchUrlSegment ]);

  useEffect(() => {
    loadBooleanQuestion(
      booleanSearchUrlSegment, 
      booleanLeftOperandParamName, 
      booleanRightOperandParamName
    );
  }, [ booleanSearchUrlSegment, booleanLeftOperandParamName, booleanRightOperandParamName ]);

  useWdkEffect(wdkService => {
    if (basketButtonStatus === 'clicked' && basketSearchState && booleanSearchState) {
      submitBasket(
        wdkService,
        basketDatasetParamName,
        basketSearchUrlSegment,
        booleanSearchState,
        booleanSearchUrlSegment,
        recordClass,
        setBasketButtonStatus,
        updateStrategy
      );
    }
  }, [ basketButtonStatus ]);

  return (
    !basketSearchState ||
    basketSearchState.questionStatus === 'loading' ||
    !booleanSearchState ||
    booleanSearchState.questionStatus === 'loading' ||
    !booleanOperatorParameter
  )
    ? <Loading />
    : (
      <div>
        <button 
          onClick={() => {
            setBasketButtonStatus('clicked');
          }} 
          disabled={
            basketButtonStatus !== 'unclicked' 
          }
          type="button">
          Combine with {recordClass.displayNamePlural} basket
        </button>
      </div>
    )
};

export const CombineStepMenu = connect<StateProps, DispatchProps, OwnProps, Props, RootState>(
  (state, ownProps) => ({
    basketSearchUrlSegment: basketSearchUrlSegment(state, ownProps),
    basketDatasetParamName: basketDatasetParamName(state, ownProps),
    basketSearchState: basketSearchState(state, ownProps),
    booleanSearchUrlSegment: booleanSearchUrlSegment(state, ownProps),
    booleanLeftOperandParamName: booleanLeftOperandParamName(state, ownProps),
    booleanRightOperandParamName: booleanRightOperandParamName(state, ownProps),
    booleanSearchState: booleanSearchState(state, ownProps),
    booleanOperatorParameter: booleanOperatorParameter(state, ownProps)
  }),
  dispatch => ({
    loadBasketQuestion: (basketSearchUrlSegment: string) => {
      dispatch(
        updateActiveQuestion({
          searchName: basketSearchUrlSegment,
          stepId: undefined
        })
      )
    },
    loadBooleanQuestion: (
      booleanSearchUrlSegment: string,
      booleanLeftOperandParamName: string,
      booleanRightOperandParamName: string
    ) => {
      dispatch(
        updateActiveQuestion({
          searchName: booleanSearchUrlSegment,
          stepId: undefined,
          paramValues: {
            [booleanLeftOperandParamName]: '',
            [booleanRightOperandParamName]: '',
            [BOOLEAN_OPERATOR_PARAM_NAME]: 'intersect'
          }
        })
      )
    },
    updateParamValue: compose(dispatch, updateParamValue),
    requestPutStrategyStepTree: compose(dispatch, requestPutStrategyStepTree)
  }),
  (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    ...dispatchProps,
    updateBooleanOperator: (newBooleanOperator: string) => {
      if (stateProps.booleanSearchState && stateProps.booleanOperatorParameter) {
        dispatchProps.updateParamValue(
          stateProps.booleanSearchUrlSegment,
          stateProps.booleanOperatorParameter,
          stateProps.booleanSearchState.paramValues,
          newBooleanOperator
        );
      }
    },
    ...ownProps
  })
)(CombineStepMenuView);

const submitBasket = async (
  wdkService: WdkService,
  basketDatasetParamName: string,
  basketSearchUrlSegment: string,
  booleanSearchState: QuestionState,
  booleanSearchUrlSegment: string,
  recordClass: RecordClass,
  setBasketButtonStatus: (newStatus: BasketButtonStatus) => void,
  updateStrategy: (newStepId: number, newSecondaryInput: StepTree) => void
) => {
  setBasketButtonStatus('loading');

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
      }
    }),
    wdkService.createStep({
      searchName: booleanSearchUrlSegment,
      searchConfig: {
        parameters: booleanSearchState.paramValues
      }
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

// A "new search" specifies a valid boolean operand <=> 
//   (1) it has no primary nor secondary input 
//   (2) its output record class matches the current record class
const isValidBooleanOperand = (
  { allowedPrimaryInputRecordClassNames, allowedSecondaryInputRecordClassNames, outputRecordClassName }: Question,
  recordClassUrlSegment: string
) =>
  !allowedPrimaryInputRecordClassNames &&
  !allowedSecondaryInputRecordClassNames &&
  outputRecordClassName === recordClassUrlSegment;
