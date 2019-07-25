import React, { useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createSelector } from 'reselect';

import { updateParamValue } from 'wdk-client/Actions/QuestionActions';
import { SingleSelect, Loading } from 'wdk-client/Components';
import { RootState } from 'wdk-client/Core/State/Types';
import { QuestionState } from 'wdk-client/StoreModules/QuestionStoreModule';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { Parameter } from 'wdk-client/Utils/WdkModel';
import { AddStepOperationFormProps } from 'wdk-client/Views/Strategy/AddStepPanel';
import { BOOLEAN_OPERATOR_PARAM_NAME, combineOperatorOrder, CombineOperator } from 'wdk-client/Views/Strategy/StrategyUtils';

import 'wdk-client/Views/Strategy/CombineWithStrategyForm.scss';

import { StrategySummary } from 'wdk-client/Utils/WdkUser';
import { useWdkEffect } from 'wdk-client/Service/WdkService';
import { StepAnalysisEnrichmentResultTable as StrategiesChoicesTable } from 'wdk-client/Core/MoveAfterRefactor/Components/StepAnalysis/StepAnalysisEnrichmentResultTable';
import { requestPutStrategyStepTree } from 'wdk-client/Actions/StrategyActions';
import { addStep } from 'wdk-client/Utils/StrategyUtils';

const cx = makeClassNameHelper('CombineWithStrategyForm');

const selectVerbiageAppend: Record<CombineOperator, string> = {
  [CombineOperator.Intersect]: 'intersected with', 
  [CombineOperator.Union]: 'unioned with', 
  [CombineOperator.LeftMinus]: 'subtracted by', 
  [CombineOperator.RightMinus]: 'subtracted from'
};

const selectVerbiageInsertBefore: Record<CombineOperator, string> = {
  [CombineOperator.Intersect]: 'intersected with', 
  [CombineOperator.Union]: 'unioned with', 
  [CombineOperator.LeftMinus]: 'subtracted from', 
  [CombineOperator.RightMinus]: 'subtracted by'
};

const selectItemsAppend = combineOperatorOrder.map(
  operator => ({
    value: operator,
    display: selectVerbiageAppend[operator]
  })
);

const selectItemsInsertBefore = combineOperatorOrder.map(
  operator => ({
    value: operator,
    display: selectVerbiageInsertBefore[operator]
  })
);

type StateProps = {
  booleanSearchUrlSegment: string,
  booleanSearchState?: QuestionState,
  booleanOperatorParameter?: Parameter
};

type DispatchProps = {
  updateParamValue: (payload: {
    searchName: string,
    parameter: Parameter, 
    paramValues: Record<string, string>, 
    paramValue: string
  }) => void
};

const recordClassSegment = createSelector(
  (_: RootState, { inputRecordClass }: OwnProps) => inputRecordClass,
  recordClass => recordClass && recordClass.fullName.replace('.', '_')
);

const booleanSearchUrlSegment = createSelector(
  recordClassSegment,
  recordClassSegment => `boolean_question_${recordClassSegment}`
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

type OwnProps = AddStepOperationFormProps;

type CombineStepFormViewProps = StateProps & {
  updateBooleanOperator: (newBooleanOperator: string) => void,
} & OwnProps;

type StrategyChoicesRow = {
  description: string,
  name: string,
  strategyId: number
};

const CombineWithStrategyFormView = ({
  booleanSearchState,
  booleanSearchUrlSegment,
  addType,
  inputRecordClass,
  updateBooleanOperator,
  stepsCompletedNumber,
  strategy,
  updateStrategy
}: CombineStepFormViewProps) => {
  const [ strategies, setStrategies ] = useState<StrategySummary[] | undefined>(undefined);
  const [ selectedStrategy, setSelectedStrategy ] = useState<number | undefined>(undefined);

  useWdkEffect(wdkService => {
    wdkService.getStrategies().then(setStrategies);
  }, []);

  useWdkEffect(wdkService => {
    if (selectedStrategy !== undefined && booleanSearchState && booleanSearchState.paramValues) {
      const operatorStepPromise = wdkService.createStep({
        searchName: booleanSearchUrlSegment,
        searchConfig: {
          parameters: booleanSearchState.paramValues
        }
      });

      const duplicateStepTreePromise = wdkService.getDuplicatedStrategyStepTree(strategy.strategyId);

      Promise.all([
        operatorStepPromise,
        duplicateStepTreePromise
      ]).then(([{ id: operatorStepId }, duplicateStepTree]) => {
        updateStrategy(operatorStepId, duplicateStepTree);
      });
    }
  }, [ selectedStrategy ]);

  const strategyChoices = useMemo(
    () => (
      strategies && 
      strategies
        .filter(
          ({ recordClassName, strategyId }) => (
            recordClassName === inputRecordClass.urlSegment &&
            strategyId !== strategy.strategyId
          )
        )
        .map(({ description, name, strategyId }) => ({ description, name, strategyId }))
    ),
    [ strategies ]
  );

  return (
      <div className={cx()}>
        {
          (
            !strategies ||
            !strategyChoices
          )
            ? <Loading />
            : (
              <>
                <div className={cx('--Header')}>
                  <h2>
                    Choose an existing strategy
                  </h2>
        
                  <div>
                    The results will be{' '}
                    <SingleSelect
                      value={booleanSearchState && booleanSearchState.paramValues[BOOLEAN_OPERATOR_PARAM_NAME]}
                      onChange={updateBooleanOperator}
                      items={addType.type === 'append' ? selectItemsAppend : selectItemsInsertBefore}
                    />
                    {' '}the results of Step {stepsCompletedNumber}.
                  </div>
                </div>
                <div className={cx('--Body')}>
                  <StrategiesChoicesTable
                    emptyResultMessage={`No other ${inputRecordClass.shortDisplayName} strategies found`}
                    rows={strategyChoices}
                    columns={[
                      {
                        key: 'name',
                        name: 'Strategy',
                        renderCell: (cellProps: { row: StrategyChoicesRow }) =>
                          <a onClick={(e) => {
                            e.preventDefault();
                            setSelectedStrategy(cellProps.row.strategyId);
                          }} href="#">
                             {cellProps.row.name} 
                          </a>,
                        sortable: true,
                        sortType: 'text'
                      },
                      {
                        key: 'description',
                        name: 'Description',
                        renderCell: (cellProps: { value: string }) =>
                          <>
                            {
                              cellProps.value
                                ? cellProps.value
                                : <em>Save to add a description</em>
                            }
                          </>,
                        sortable: true,
                        sortType: 'text'
                      }
                    ]}
                  />
                </div>
              </>
            )
        }
      </div>
    );
};

export const CombineWithStrategyForm = connect<StateProps, DispatchProps, OwnProps, CombineStepFormViewProps, RootState>(
  (state, ownProps) => ({
    booleanSearchUrlSegment: booleanSearchUrlSegment(state, ownProps),
    booleanSearchState: booleanSearchState(state, ownProps),
    booleanOperatorParameter: booleanOperatorParameter(state, ownProps)
  }),
  dispatch => ({
    updateParamValue: compose(dispatch, updateParamValue)
  }),
  (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
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
)(CombineWithStrategyFormView);
