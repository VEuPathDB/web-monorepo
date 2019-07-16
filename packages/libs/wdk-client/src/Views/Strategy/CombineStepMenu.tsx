import React, { useEffect, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createSelector } from 'reselect';
import { get } from 'lodash';

import { updateActiveQuestion, updateParamValue } from 'wdk-client/Actions/QuestionActions';
import { requestPutStrategyStepTree } from 'wdk-client/Actions/StrategyActions';
import { Loading, Tooltip, Link, Icon, CategoriesCheckboxTree } from 'wdk-client/Components';
import { LinksPosition } from 'wdk-client/Components/CheckboxTree/CheckboxTree';
import { RootState } from 'wdk-client/Core/State/Types';
import WdkService, { useWdkEffect } from 'wdk-client/Service/WdkService';
import { QuestionState } from 'wdk-client/StoreModules/QuestionStoreModule';
import { Parameter, RecordClass } from 'wdk-client/Utils/WdkModel';
import { StepTree } from 'wdk-client/Utils/WdkUser';
import { AddStepOperationMenuProps } from 'wdk-client/Views/Strategy/AddStepPanel';
import { cxStepBoxes as cxOperator } from 'wdk-client/Views/Strategy/ClassNames';
import { getTargetType, getRecordClassUrlSegment, getDisplayName, getTooltipContent, CategoryTreeNode, getLabel } from 'wdk-client/Utils/CategoryUtils';
import { combineOperatorOrder, BOOLEAN_OPERATOR_PARAM_NAME, CombineOperator } from 'wdk-client/Views/Strategy/StrategyUtils';

type StateProps = {
  basketSearchUrlSegment: string,
  basketDatasetParamName: string,
  basketSearchShortDisplayName?: string,
  booleanSearchUrlSegment: string,
  booleanLeftOperandParamName: string,
  booleanRightOperandParamName: string,
  booleanSearchState?: QuestionState,
  booleanOperatorParameter?: Parameter,
  searchTree: CategoryTreeNode,
  linkPlacement: LinksPosition
};

const recordClassSegment = createSelector(
  (_: RootState, { recordClass }: OwnProps) => recordClass,
  recordClass => recordClass && recordClass.fullName.replace('.', '_')
);

const basketSearchUrlSegment = createSelector(
  recordClassSegment,
  recordClassSegment => `${recordClassSegment}BySnapshotBasket`
);

const basketSearchShortDisplayName = createSelector(
  basketSearchUrlSegment,
  ({ globalData: { questions } }: RootState) => questions,
  (basketSearchUrlSegment, questions) => {
    if (!questions) {
      return undefined;
    }

    const basketSearchQuestion = questions.find(({ urlSegment }) => urlSegment === basketSearchUrlSegment);
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
  recordClassSegment => `bq_left_op_${recordClassSegment}`
);

const booleanRightOperandParamName = createSelector(
  recordClassSegment,
  recordClassSegment => `bq_right_op_${recordClassSegment}`
);

const searchTree = createSelector(
  ({ globalData }: RootState) => globalData, 
  (_: RootState, { recordClass: { fullName } }: OwnProps) => fullName,
  (globalData, recordClassFullName) => {
    // FIXME: This is not typesafe
    const fullSearchTree = get(globalData, 'searchTree') as CategoryTreeNode;
    const prunedTree = fullSearchTree.children.find(node => getLabel(node) === recordClassFullName) as CategoryTreeNode;

    return prunedTree;
  }
);

const linkPlacement = createSelector(
  searchTree,
  searchTree => {
    const hasNoGrandchildren = searchTree.children.every(child => child.children.length === 0);

    return hasNoGrandchildren
      ? LinksPosition.None
      : LinksPosition.Top;
  }
);

type DispatchProps = {
  loadBooleanQuestion: (
    booleanSearchUrlSegment: string,
    booleanLeftOperandParamName: string,
    booleanRightOperandParamName: string
  ) => void,
  updateParamValue: (payload: {
    searchName: string,
    parameter: Parameter, 
    paramValues: Record<string, string>, 
    paramValue: string
  }) => void
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
    basketSearchShortDisplayName,
    basketDatasetParamName,
    booleanSearchUrlSegment,
    booleanSearchState,
    booleanLeftOperandParamName,
    booleanRightOperandParamName,
    booleanOperatorParameter,
    loadBooleanQuestion,
    recordClass,
    updateBooleanOperator,
    updateStrategy,
    searchTree,
    startOperationForm,
    linkPlacement
  }: Props
) => {
  const [ basketButtonStatus, setBasketButtonStatus ] = useState<BasketButtonStatus>('unclicked');
  const [ expandedBranches, setExpandedBranches ] = useState<string[]>([]);
  const [ searchTerm, setSearchTerm ] = useState<string>('');
  
  useEffect(() => {
    loadBooleanQuestion(
      booleanSearchUrlSegment, 
      booleanLeftOperandParamName, 
      booleanRightOperandParamName
    );
  }, [ booleanSearchUrlSegment, booleanLeftOperandParamName, booleanRightOperandParamName ]);

  useWdkEffect(wdkService => {
    if (basketButtonStatus === 'clicked' && basketSearchShortDisplayName && booleanSearchState) {
      submitBasket(
        wdkService,
        basketDatasetParamName,
        basketSearchShortDisplayName,
        basketSearchUrlSegment,
        booleanSearchState,
        booleanSearchUrlSegment,
        recordClass,
        setBasketButtonStatus,
        updateStrategy
      );
    }
  }, [ basketButtonStatus ]);

  const renderNode = useCallback((node: any) => {
    const displayName = getDisplayName(node);
    const displayElement = getTargetType(node) === 'search'
      ? <Link 
          onClick={(e: Event) => {
            e.preventDefault();
            startOperationForm(node.wdkReference.urlSegment);
          }}
          to={`/search/${getRecordClassUrlSegment(node)}/${node.wdkReference.urlSegment}`}
        >
          {displayName}
        </Link>
      : <span>{displayName}</span>
  
    const tooltipContent = getTooltipContent(node);
    
    return tooltipContent
      ? (
        <Tooltip content={tooltipContent}>
          {displayElement}
        </Tooltip>
      )
      : displayElement;
  }, []);

  return (
    !basketSearchShortDisplayName ||
    !booleanSearchState ||
    booleanSearchState.questionStatus === 'loading' ||
    !booleanOperatorParameter
  )
    ? <Loading />
    : (
      <div>
        {
          combineOperatorOrder.map(operator => (
            <div key={operator} >
              <input
                id={operator}
                type="radio"
                name="operator"
                value={operator}
                defaultChecked={operator === booleanSearchState.paramValues[BOOLEAN_OPERATOR_PARAM_NAME]}
                onChange={e => {
                  updateBooleanOperator(e.target.value);
                }}
              />
              <label htmlFor={operator}>
                <div className={cxOperator('--CombineOperator', operator)}>
                </div>
              </label>
            </div>
          ))
        }
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
        <CategoriesCheckboxTree
          selectedLeaves={NO_SELECTED_LEAVES}
          onChange={NOOP}
          tree={searchTree}
          expandedBranches={expandedBranches}
          searchTerm={searchTerm}
          isSelectable={false}
          searchBoxPlaceholder="Find a search..."
          leafType="search"
          renderNode={renderNode}
          renderNoResults={renderNoResults}
          onUiChange={setExpandedBranches}
          onSearchTermChange={setSearchTerm}
          linkPlacement={linkPlacement}
        />
      </div>
    )
};

const NO_SELECTED_LEAVES: string[] = [];
const NOOP = () => {};

function renderNoResults(searchTerm: string) {
  return (
    <div>
      <p>
        <Icon type="warning"/> We could not find any searches matching "{searchTerm}".
      </p>
    </div>
  )
}

export const CombineStepMenu = connect<StateProps, DispatchProps, OwnProps, Props, RootState>(
  (state, ownProps) => ({
    basketSearchUrlSegment: basketSearchUrlSegment(state, ownProps),
    basketDatasetParamName: basketDatasetParamName(state, ownProps),
    basketSearchShortDisplayName: basketSearchShortDisplayName(state, ownProps),
    booleanSearchUrlSegment: booleanSearchUrlSegment(state, ownProps),
    booleanLeftOperandParamName: booleanLeftOperandParamName(state, ownProps),
    booleanRightOperandParamName: booleanRightOperandParamName(state, ownProps),
    booleanSearchState: booleanSearchState(state, ownProps),
    booleanOperatorParameter: booleanOperatorParameter(state, ownProps),
    searchTree: searchTree(state, ownProps),
    linkPlacement: linkPlacement(state, ownProps)
  }),
  dispatch => ({
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
            [BOOLEAN_OPERATOR_PARAM_NAME]: CombineOperator.Intersect
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
      },
      customName: basketSearchShortDisplayName
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
