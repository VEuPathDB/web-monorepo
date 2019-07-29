import React, { useState, useCallback, useMemo } from 'react';

import { CategoriesCheckboxTree, Icon, Tooltip, Link } from 'wdk-client/Components';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { RecordClass } from 'wdk-client/Utils/WdkModel';

import 'wdk-client/Views/Strategy/SearchInputSelector.scss';
import { noop } from 'lodash';
import { getDisplayName, getTargetType, getRecordClassUrlSegment, CategoryTreeNode, getTooltipContent } from 'wdk-client/Utils/CategoryUtils';
import { LinksPosition } from 'wdk-client/Components/CheckboxTree/CheckboxTree';

type Props = {
  containerClassName?: string,
  onCombineWithBasketClicked: (e: React.MouseEvent) => void,
  onCombineWithStrategyClicked: (e: React.MouseEvent) => void,
  onCombineWithNewSearchClicked: (newSearchUrlSegment: string) => void,
  combinedWithBasketDisabled?: boolean,
  inputRecordClass: RecordClass,
  searchTree: CategoryTreeNode
};

const cx = makeClassNameHelper('SearchInputSelector');

export const SearchInputSelector = ({
  containerClassName,
  combinedWithBasketDisabled,
  inputRecordClass,
  onCombineWithBasketClicked,
  onCombineWithStrategyClicked,
  onCombineWithNewSearchClicked,
  searchTree
}: Props) => {
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
  }, []);

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

  return (
    <div className={containerClassName}>
      <button 
        onClick={onCombineWithBasketClicked} 
        disabled={combinedWithBasketDisabled}
        type="button"
      >
        Your {inputRecordClass.shortDisplayNamePlural} basket
      </button>
      <button onClick={onCombineWithStrategyClicked}>
        A {inputRecordClass.shortDisplayNamePlural} strategy
      </button>
      <div className={cx('--NewSearchCheckbox')}>
        <div className={cx('--CheckboxHeader')}>
          A new {inputRecordClass.shortDisplayNamePlural} search
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
    </div>
  );
};
