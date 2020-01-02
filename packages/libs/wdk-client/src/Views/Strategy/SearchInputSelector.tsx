import React, { useState, useCallback, useMemo, useEffect } from 'react';

import { noop } from 'lodash';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { CategoriesCheckboxTree, Icon, Tooltip, Link, Loading } from 'wdk-client/Components';
import { LinksPosition } from 'wdk-client/Components/CheckboxTree/CheckboxTree';
import { RootState } from 'wdk-client/Core/State/Types';
import { getDisplayName, getTargetType, getRecordClassUrlSegment, CategoryTreeNode, getTooltipContent, getAllBranchIds, getRecordClassName, EMPTY_CATEGORY_TREE_NODE, isQualifying } from 'wdk-client/Utils/CategoryUtils';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { RecordClass } from 'wdk-client/Utils/WdkModel';

import 'wdk-client/Views/Strategy/SearchInputSelector.scss';
import { DispatchAction } from 'wdk-client/Core/CommonTypes';
import { compose } from 'redux';
import { requestBasketCounts } from 'wdk-client/Actions/BasketActions';
import { pruneDescendantNodes, getLeaves } from 'wdk-client/Utils/TreeUtils';

type StateProps = {
  basketCount?: number,
  hasOtherStrategies: boolean,
  isGuest?: boolean,
  searchTree: CategoryTreeNode
};

type DispatchProps = {
  requestBasketCounts: () => void;
};

type OwnProps = {
  containerClassName?: string,
  onCombineWithBasketClicked: (e: React.MouseEvent) => void,
  onCombineWithStrategyClicked: (e: React.MouseEvent) => void,
  onCombineWithNewSearchClicked: (newSearchUrlSegment: string) => void,
  inputRecordClass: RecordClass
};

type Props = StateProps & DispatchProps & OwnProps;

const cx = makeClassNameHelper('SearchInputSelector');

export const SearchInputSelectorView = ({
  basketCount,
  containerClassName,
  hasOtherStrategies,
  inputRecordClass,
  isGuest,
  onCombineWithBasketClicked,
  onCombineWithStrategyClicked,
  onCombineWithNewSearchClicked,
  searchTree,
  requestBasketCounts
}: Props) => {
  useEffect(() => {
    if (!isGuest) {
      requestBasketCounts();
    }
  }, [ isGuest ]);

  const { linksPosition, initialExpandedBranches, showSearchBox, finalTree } = useMemo(
    () => {
      const has0Categories = searchTree.children.every(child => child.children.length === 0);
      const has1Category = searchTree.children.length === 1 && searchTree.children[0].children.every(child => child.children.length === 0);
      const checkboxRowsCount = countCheckboxRows(searchTree);
      const allBranchIds = getAllBranchIds(searchTree);
      const SMALL_CHECKBOX_ROW_COUNT = 8;
      const MIN_CATEGORIES_TO_SHOW = 5;

      // If there are 0 or 1 search categories, or fewer than SMALL_CHECKBOX_ROW_COUNT rows in the checkbox tree
      // ... don't offer expand/collapse links, and start expanded
      const [ linksPosition, initialExpandedBranches ] = has0Categories || has1Category || checkboxRowsCount < SMALL_CHECKBOX_ROW_COUNT
        ? [ LinksPosition.None, allBranchIds ]
        : [ LinksPosition.Top, [] ];

      // If there are fewer than SMALL_CHECKBOX_ROW_COUNT rows in the checkbox tree
      // ... don't offer a search box
      const showSearchBox = checkboxRowsCount >= SMALL_CHECKBOX_ROW_COUNT;

      const finalTree: CategoryTreeNode = allBranchIds.length >= MIN_CATEGORIES_TO_SHOW
        ? searchTree
        : { properties: { }, children: getLeaves(searchTree, node => node.children) }

      return { linksPosition, initialExpandedBranches, showSearchBox, finalTree };

      function countCheckboxRows(node: CategoryTreeNode): number {
        return node.children.reduce(
          (count, child) => count + countCheckboxRows(child), 
          node.children.length
        );
      }
    },
    [ searchTree ]
  );

  const [ expandedBranches, setExpandedBranches ] = useState(initialExpandedBranches);
  const [ searchTerm, setSearchTerm ] = useState('');

  const renderNode = useCallback((node: any) => {
    const displayName = getDisplayName(node);
    const displayElement = getTargetType(node) === 'search'
      ? <Link 
          onClick={(e: Event) => {
            e.preventDefault();
            onCombineWithNewSearchClicked(node.wdkReference.urlSegment);
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
  }, [ onCombineWithNewSearchClicked ]);

  const noSelectedLeaves = useMemo(
    () => [] as string[],
    []
  );

  const renderNoResults = useCallback(
    (searchTerm: string) =>
      <div>
        <p>
          <Icon type="warning"/> We could not find any searches matching "{searchTerm}".
        </p>
      </div>,
    []
  );
  
  const [ combineWithBasketDisabled, combineWithBasketTooltip ] = isGuest 
    ?  [true, 'You must log in to use this feature' ]
    : basketCount === 0
    ? [ true, `Your ${inputRecordClass.displayNamePlural} basket is empty` ]
    : [ false, undefined ];

  const [ combineWithStrategyDisabled, combineWithStrategyTooltip ] = hasOtherStrategies
    ? [ false, undefined ]
    : [ true, `You have no other ${inputRecordClass.displayNamePlural} strategies` ];

  return isGuest === undefined || (isGuest === false && basketCount === undefined)
    ? <Loading />
    : <div className={`${containerClassName || ''} ${cx()}`}>
        <button 
          onClick={onCombineWithBasketClicked} 
          disabled={combineWithBasketDisabled}
          type="button"
          title={combineWithBasketTooltip}
        >
          Your {inputRecordClass.displayNamePlural} basket
        </button>
        <button 
          onClick={onCombineWithStrategyClicked}
          disabled={combineWithStrategyDisabled}
          type="button"
          title={combineWithStrategyTooltip}
        >
          A {inputRecordClass.displayNamePlural} strategy
        </button>
        <div className={cx('--NewSearchCheckbox')}>
          <div className={cx('--CheckboxHeader')}>
            A new {inputRecordClass.displayNamePlural} search
          </div>
          <div className={cx('--CheckboxContainer')}>
            <CategoriesCheckboxTree
              selectedLeaves={noSelectedLeaves}
              onChange={noop}
              tree={finalTree}
              expandedBranches={expandedBranches}
              searchTerm={searchTerm}
              isSelectable={false}
              searchBoxPlaceholder="Filter the searches below..."
              leafType="search"
              renderNode={renderNode}
              renderNoResults={renderNoResults}
              onUiChange={setExpandedBranches}
              onSearchTermChange={setSearchTerm}
              linksPosition={linksPosition}
              showSearchBox={showSearchBox}
            />
          </div>
        </div>
      </div>;
};

const isGuest = ({ globalData: { user } }: RootState) => user && user.isGuest;

const basketCount = ({ basket }: RootState, { inputRecordClass: { urlSegment } }: OwnProps) =>
    basket.counts && basket.counts[urlSegment];

const openedStrategiesSet = createSelector(
  ({ strategyWorkspace: { openedStrategies } }: RootState) => openedStrategies,
  openedStrategies => openedStrategies && new Set(openedStrategies)
);

// We permit combining with strategies which are open or saved
const hasOtherStrategies = createSelector(
  ({ strategyWorkspace: { strategySummaries } }: RootState) => strategySummaries,
  ({ strategyWorkspace: { activeStrategy } }: RootState) => activeStrategy && activeStrategy.strategyId,
  (_: RootState, { inputRecordClass: { urlSegment: inputRecordClassName } }: OwnProps) => inputRecordClassName,
  openedStrategiesSet,
  (strategySummaries, activeStrategyId, inputRecordClassName, openedStrategiesSet) => !strategySummaries || !activeStrategyId || !openedStrategiesSet
    ? false
    : strategySummaries.some(({ isSaved, strategyId, recordClassName }) => 
        recordClassName === inputRecordClassName &&
        strategyId !== activeStrategyId &&
        (
          openedStrategiesSet.has(strategyId) ||
          isSaved
        )
      )
);

const isSearchNode = isQualifying({
  targetType: 'search',
  scope: 'menu'
})

const searchTree = createSelector(
  ({ globalData }: RootState) => globalData.ontology,
  (_: RootState, { inputRecordClass: { fullName } }: OwnProps) => fullName,
  (ontology, recordClassFullName) =>
    ontology == null ? EMPTY_CATEGORY_TREE_NODE : pruneDescendantNodes(
      node => node.children.length > 0 || (
        isSearchNode(node)  &&
        getRecordClassName(node) === recordClassFullName
      ),
      ontology.tree)
);



const mapStateToProps = (state: RootState, props: OwnProps): StateProps => ({
  isGuest: isGuest(state),
  basketCount: basketCount(state, props),
  hasOtherStrategies: hasOtherStrategies(state, props),
  searchTree: searchTree(state, props)
});

const mapDispatchToProps = (dispatch: DispatchAction) => ({
  requestBasketCounts: compose(dispatch, requestBasketCounts)
})

export const SearchInputSelector = connect(mapStateToProps, mapDispatchToProps)(SearchInputSelectorView);
