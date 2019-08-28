import React, { useState, useCallback, useMemo, useEffect } from 'react';

import { noop, get } from 'lodash';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { CategoriesCheckboxTree, Icon, Tooltip, Link, Loading } from 'wdk-client/Components';
import { LinksPosition } from 'wdk-client/Components/CheckboxTree/CheckboxTree';
import { RootState } from 'wdk-client/Core/State/Types';
import { getDisplayName, getTargetType, getRecordClassUrlSegment, CategoryTreeNode, getTooltipContent, getLabel } from 'wdk-client/Utils/CategoryUtils';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { RecordClass } from 'wdk-client/Utils/WdkModel';

import 'wdk-client/Views/Strategy/SearchInputSelector.scss';
import { DispatchAction } from 'wdk-client/Core/CommonTypes';
import { compose } from 'redux';
import { requestBasketCounts } from 'wdk-client/Actions/BasketActions';

type StateProps = {
  basketCount?: number,
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

  const [ expandedBranches, setExpandedBranches ] = useState<string[]>([]);
  const [ searchTerm, setSearchTerm ] = useState<string>('');

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

  const linkPlacement = useMemo(
    () => {
      const hasNoGrandchildren = searchTree.children.every(child => child.children.length === 0);
  
      return hasNoGrandchildren
        ? LinksPosition.None
        : LinksPosition.Top;
    },
    [ searchTree ]
  );
  
  const [ combineWithBasketDisabled, combineWithBasketTooltip ] = isGuest 
    ? [true, 'You must log in to use this feature']
    : basketCount === 0
    ? [true, `Your ${inputRecordClass.displayNamePlural} basket is empty`]
    : [false, undefined];

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
        <button onClick={onCombineWithStrategyClicked}>
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
      </div>;
};

const isGuest = ({ globalData: { user } }: RootState) => user && user.isGuest;

const basketCount = ({ basket }: RootState, { inputRecordClass: { urlSegment } }: OwnProps) =>
    basket.counts && basket.counts[urlSegment];

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



const mapStateToProps = (state: RootState, props: OwnProps): StateProps => ({
  isGuest: isGuest(state),
  basketCount: basketCount(state, props),
  searchTree: searchTree(state, props)
});

const mapDispatchToProps = (dispatch: DispatchAction) => ({
  requestBasketCounts: compose(dispatch, requestBasketCounts)
})

export const SearchInputSelector = connect(mapStateToProps, mapDispatchToProps)(SearchInputSelectorView);
