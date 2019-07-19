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
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { Parameter, RecordClass } from 'wdk-client/Utils/WdkModel';
import { StepTree } from 'wdk-client/Utils/WdkUser';
import { AddStepOperationMenuProps } from 'wdk-client/Views/Strategy/AddStepPanel';
import { cxStepBoxes as cxOperator } from 'wdk-client/Views/Strategy/ClassNames';
import { getTargetType, getRecordClassUrlSegment, getDisplayName, getTooltipContent, CategoryTreeNode, getLabel } from 'wdk-client/Utils/CategoryUtils';
import { combineOperatorOrder, BOOLEAN_OPERATOR_PARAM_NAME } from 'wdk-client/Views/Strategy/StrategyUtils';

import 'wdk-client/Views/Strategy/CombineStepMenu.scss';

const cx = makeClassNameHelper('CombineStepMenu');

type StateProps = {
  basketSearchUrlSegment: string,
  basketDatasetParamName: string,
  basketSearchShortDisplayName?: string,
  booleanSearchUrlSegment: string,
  booleanSearchState?: QuestionState,
  booleanOperatorParameter?: Parameter,
  searchTree: CategoryTreeNode,
  linkPlacement: LinksPosition
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

const searchTree = createSelector(
  ({ globalData }: RootState) => globalData, 
  (_: RootState, { inputRecordClass: { fullName } }: OwnProps) => fullName,
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
    booleanOperatorParameter,
    loadBooleanQuestion,
    inputRecordClass,
    updateBooleanOperator,
    updateStrategy,
    searchTree,
    startOperationForm,
    linkPlacement,
    operandStep
  }: Props
) => {
  const [ basketButtonStatus, setBasketButtonStatus ] = useState<BasketButtonStatus>('unclicked');
  const [ expandedBranches, setExpandedBranches ] = useState<string[]>([]);
  const [ searchTerm, setSearchTerm ] = useState<string>('');
  
  useEffect(() => {
    loadBooleanQuestion(booleanSearchUrlSegment);
  }, [ booleanSearchUrlSegment ]);

  useWdkEffect(wdkService => {
    if (basketButtonStatus === 'clicked' && basketSearchShortDisplayName && booleanSearchState) {
      submitBasket(
        wdkService,
        basketDatasetParamName,
        basketSearchShortDisplayName,
        basketSearchUrlSegment,
        booleanSearchState,
        booleanSearchUrlSegment,
        inputRecordClass,
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

  const onOperatorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateBooleanOperator(e.target.value);
  }, [ updateBooleanOperator ]);

  const onCombineWithBasketClicked = useCallback((e: React.MouseEvent) => {
    setBasketButtonStatus('clicked');
  }, []);

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
                  with another set of {inputRecordClass.shortDisplayNamePlural} from:
              </div>
              <div className={cx('--Body')}>
                <div className={cx('--PrimaryInputLabel')}>
                  {operandStep.estimatedSize} {operandStep.estimatedSize === 1 ? inputRecordClass.shortDisplayName : inputRecordClass.shortDisplayNamePlural}
                </div>
                <div className={cx('--OperatorSelector')}>
                  {
                    combineOperatorOrder.map(operator => (
                      <div key={operator} >
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
                <div className={cx('--SecondaryInputSelector')}>
                  <button 
                    onClick={onCombineWithBasketClicked} 
                    disabled={basketButtonStatus !== 'unclicked'}
                    type="button">
                    Your {inputRecordClass.shortDisplayNamePlural} basket
                  </button>
                  <button onClick={TODO}>
                    A {inputRecordClass.shortDisplayNamePlural} strategy
                  </button>
                  <div className={cx('--NewSearchCheckbox')}>
                    A new {inputRecordClass.shortDisplayNamePlural} search
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
                </div>
              </div>
            </div>
          )
      }
    </div>
  );
};

const TODO = () => alert('TODO');

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
    booleanSearchState: booleanSearchState(state, ownProps),
    booleanOperatorParameter: booleanOperatorParameter(state, ownProps),
    searchTree: searchTree(state, ownProps),
    linkPlacement: linkPlacement(state, ownProps)
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
