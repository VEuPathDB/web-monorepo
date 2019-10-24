import React, { useCallback, useState, useMemo } from 'react';
import { connect } from 'react-redux';

import { get, noop } from 'lodash';

import { CategoriesCheckboxTree, Link, Tooltip, Icon, Loading } from 'wdk-client/Components';
import { RootState } from 'wdk-client/Core/State/Types';
import { CategoryTreeNode, getDisplayName, getTargetType, getRecordClassUrlSegment, getTooltipContent } from 'wdk-client/Utils/CategoryUtils';

import { makeVpdbClassNameHelper } from './Utils';

const cx = makeVpdbClassNameHelper('SearchPane');
const cxTheme = makeVpdbClassNameHelper('BgWash');

type StateProps = {
  searchTree?: CategoryTreeNode
};

type Props = StateProps;

const SearchPaneView = (props: Props) => {
  const [ expandedBranches, setExpandedBranches ] = useState<string[]>([]);
  const [ searchTerm, setSearchTerm ] = useState('');

  const renderNode = useCallback((node: any, path?: number[]) => {
    const rawDisplayName = getDisplayName(node);
    const displayName = path && path.length === 1 ? rawDisplayName.toUpperCase() : rawDisplayName;
    const displayElement = getTargetType(node) === 'search'
      ? <Link to={`/search/${getRecordClassUrlSegment(node)}/${node.wdkReference.urlSegment}`}>
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

  return (
    <nav className={`${cx()} ${cxTheme()}`}>
      <h4>
        SPECIALIZED SEARCHES
      </h4> 
      {!props.searchTree 
        ? <Loading />
        : <CategoriesCheckboxTree
            selectedLeaves={noSelectedLeaves}
            onChange={noop}
            tree={props.searchTree}
            expandedBranches={expandedBranches}
            searchTerm={searchTerm}
            isSelectable={false}
            searchBoxPlaceholder="Find a search..."
            leafType="search"
            renderNode={renderNode}
            renderNoResults={renderNoResults}
            onUiChange={setExpandedBranches}
            onSearchTermChange={setSearchTerm}
            showSearchBox   
          />
      }
      <h2>
        What do you want to explore?
      </h2>
    </nav>
  );
};

const mapStateToProps = (state: RootState) => ({
  // FIXME: This is not typesafe
  searchTree: get(state.globalData, 'searchTree') as CategoryTreeNode
});

export const SearchPane = connect(mapStateToProps)(SearchPaneView);
