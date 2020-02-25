import React, { useState, useCallback, useMemo, useEffect } from 'react';

import { noop, orderBy } from 'lodash';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createSelector } from 'reselect';

import { requestBasketCounts } from 'wdk-client/Actions/BasketActions';
import { CategoriesCheckboxTree, Icon, Tooltip, Link, Loading, Tabs, IconAlt } from 'wdk-client/Components';
import { LinksPosition } from 'wdk-client/Components/CheckboxTree/CheckboxTree';
import { DispatchAction } from 'wdk-client/Core/CommonTypes';
import { RootState } from 'wdk-client/Core/State/Types';
import { getDisplayName, getTargetType, getRecordClassUrlSegment, CategoryTreeNode, getTooltipContent, getAllBranchIds, getRecordClassName, EMPTY_CATEGORY_TREE_NODE, isQualifying, CategoryOntology } from 'wdk-client/Utils/CategoryUtils';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { pruneDescendantNodes, getLeaves, mapStructure } from 'wdk-client/Utils/TreeUtils';
import { StrategyDetails } from 'wdk-client/Utils/WdkUser';
import { RecordClass } from 'wdk-client/Utils/WdkModel';

import { BasketInput } from 'wdk-client/Views/Strategy/BasketInput';
import { StrategyInputSelector } from 'wdk-client/Views/Strategy/StrategyInputSelector';

import 'wdk-client/Views/Strategy/SearchInputSelector.scss';


type StateProps = {
  basketCounts?: Record<string, number>,
  isGuest?: boolean,
  searchTree: CategoryTreeNode
};

type DispatchProps = {
  requestBasketCounts: () => void;
};

type OwnProps = {
  containerClassName?: string,
  onCombineWithBasketSelected: (recordClassUrlSegment: string) => void,
  onCombineWithStrategySelected: (strategyId: number, strategyDescription: string, recordClassesByUrlSegment: string) => void,
  onCombineWithNewSearchSelected: (newSearchUrlSegment: string) => void,
  inputRecordClasses: RecordClass[],
  recordClassesByUrlSegment: Record<string, RecordClass>,
  strategy: StrategyDetails,
  selectBasketButtonText: string
};

type Props = StateProps & DispatchProps & OwnProps;

const cx = makeClassNameHelper('SearchInputSelector');

export const SearchInputSelectorView = ({
  basketCounts,
  containerClassName,
  inputRecordClasses,
  isGuest,
  onCombineWithBasketSelected,
  onCombineWithStrategySelected,
  onCombineWithNewSearchSelected,
  searchTree,
  recordClassesByUrlSegment,
  requestBasketCounts,
  strategy,
  selectBasketButtonText
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
            onCombineWithNewSearchSelected(node.wdkReference.urlSegment);
          }}
          to={`/search/${getRecordClassUrlSegment(node)}/${node.wdkReference.urlSegment}`}
        >
          <IconAlt fa="search" />
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
  }, [ onCombineWithNewSearchSelected ]);

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
  
  const [ selectedTab, onTabSelected ] = useState<TabKey>('new-search');

  return isGuest == null || (isGuest === false && basketCounts == null)
    ? <Loading />
    : <div className={`${containerClassName || ''} ${cx()}`}>
        <Tabs
          tabs={[
            {
              key: 'new-search',
              display: (
                <TabDisplay
                  tabKey="new-search"
                  tabLabel="A new search"
                  selectedTab={selectedTab}
                  onTabSelected={onTabSelected}
                />
              ),
              content: (
                <React.Fragment>
                  <div className={cx('--NewSearchCheckbox')}>
                    <div className={cx('--CheckboxContainer')}>
                      <CategoriesCheckboxTree
                        containerClassName="wdk-SearchTree"
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
                </React.Fragment>
              )
            },
            {
              key: 'another-strategy',
              display: (
                <TabDisplay
                  tabKey="another-strategy"
                  tabLabel="An existing strategy"
                  selectedTab={selectedTab}
                  onTabSelected={onTabSelected}
                />
              ),
              content: (
                <StrategyInputSelector
                  onStrategySelected={onCombineWithStrategySelected}
                  primaryInput={strategy}
                  recordClassesByUrlSegment={recordClassesByUrlSegment}
                  secondaryInputRecordClasses={inputRecordClasses}
                />
              )
            },
            {
              key: 'basket',
              display: (
                <TabDisplay
                  tabKey="basket"
                  tabLabel="My basket"
                  selectedTab={selectedTab}
                  onTabSelected={onTabSelected}
                />
              ),
              content: (
                <BasketInput
                  inputRecordClasses={inputRecordClasses}
                  onSelectBasket={onCombineWithBasketSelected}
                  basketCounts={basketCounts}
                  isGuest={isGuest}
                  selectBasketButtonText={selectBasketButtonText}
                />
              )
            }
          ]}
          activeTab={selectedTab}
          onTabSelected={onTabSelected}
          displayIsNavigable
        />
      </div>;
};

type TabKey = "new-search" | "another-strategy" | "basket";

type TabDisplayProps = {
  selectedTab: TabKey,
  tabKey: TabKey,
  tabLabel: string,
  onTabSelected: (newSelection: TabKey) => void
};

const TabDisplay = ({
  selectedTab,
  tabKey,
  tabLabel,
  onTabSelected
}: TabDisplayProps) => {
  const changeTab = useCallback(() => {
    onTabSelected(tabKey);
  }, [ tabKey, onTabSelected ]);

  return (
    <React.Fragment>
      <input
        id={tabKey}
        type="radio"
        name="search-input__source-choice"
        value={tabKey}
        checked={tabKey === selectedTab}
        onChange={changeTab}
      />
      <label htmlFor={tabKey} onClick={changeTab}>
        {tabLabel}
      </label>
    </React.Fragment>
  );
};

const isGuest = ({ globalData: { user } }: RootState) => user && user.isGuest;

const basketCounts = ({ basket }: RootState, { inputRecordClasses }: OwnProps) => basket.counts;

const isSearchNode = isQualifying({
  targetType: 'search',
  scope: 'menu'
})

const searchTree = createSelector(
  ({ globalData }: RootState) => globalData.ontology,
  (_: RootState, { inputRecordClasses }: OwnProps) => inputRecordClasses,
  (ontology, inputRecordClasses) =>
    ontology == null || inputRecordClasses.length === 0
      ? EMPTY_CATEGORY_TREE_NODE
      : inputRecordClasses.length === 1
      ? pruneAndOrderSearchesForRecordClass(ontology, inputRecordClasses[0])
      : {
          properties: {},
          children: inputRecordClasses.map(inputRecordClass => ({
            properties: {
              label: [ inputRecordClass.fullName ],
              'EuPathDB alternative term': [ inputRecordClass.displayNamePlural ]
            },
            children: pruneAndOrderSearchesForRecordClass(ontology, inputRecordClass).children
          }))
        }
);

// FIXME: This logic needs to be unified with the similar logic for the new home page's searchTree, or...
const pruneAndOrderSearchesForRecordClass = (ontology: CategoryOntology, recordClass: RecordClass) => {
  const unorderedSearchesInitial = pruneDescendantNodes(
    node => node.children.length > 0 || (
      isSearchNode(node) &&
      getRecordClassName(node) === recordClass.fullName
    ),
    ontology.tree
  );

  const unorderedSearchesLeaves = getLeaves(unorderedSearchesInitial, node => node.children);
  const MAX_LEAVES_IN_FLAT_TREE = 8;

  const unorderedSearchesPenultimate = unorderedSearchesLeaves.length <= MAX_LEAVES_IN_FLAT_TREE
    ? {
        properties: {},
        children: unorderedSearchesLeaves
      }
    : unorderedSearchesInitial;

  return mapStructure(
    (node, mappedChildren: CategoryTreeNode[]) => {
      return {
        ...node,
        children: orderBy(mappedChildren, getDisplayName)
      };
    },
    node => node.children,
    unorderedSearchesPenultimate
  );
};

const mapStateToProps = (state: RootState, props: OwnProps): StateProps => ({
  isGuest: isGuest(state),
  basketCounts: basketCounts(state, props),
  searchTree: searchTree(state, props)
});

const mapDispatchToProps = (dispatch: DispatchAction) => ({
  requestBasketCounts: compose(dispatch, requestBasketCounts)
});

export const SearchInputSelector = connect(mapStateToProps, mapDispatchToProps)(SearchInputSelectorView);
