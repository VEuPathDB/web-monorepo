import React, { useCallback, useState, useMemo } from 'react';
import { connect } from 'react-redux';

import { get, noop } from 'lodash';

import { CategoriesCheckboxTree, Link, Tooltip, Icon, Loading, IconAlt } from 'wdk-client/Components';
import { LinksPosition } from 'wdk-client/Components/CheckboxTree/CheckboxTree';
import { RootState } from 'wdk-client/Core/State/Types';
import { CategoryTreeNode, getDisplayName, getTargetType, getRecordClassUrlSegment, getTooltipContent } from 'wdk-client/Utils/CategoryUtils';

import { makeVpdbClassNameHelper } from './Utils';

import './SearchPane.scss';

const cx = makeVpdbClassNameHelper('SearchPane');
const cxTheme = makeVpdbClassNameHelper('BgWash');

type StateProps = {
  searchTree?: CategoryTreeNode
};

type Props = StateProps;

const SearchPaneView = (props: Props) => {
  const [ expandedBranches, setExpandedBranches ] = useState<string[]>([]);
  const [ searchTerm, setSearchTerm ] = useState('');

  const renderNode = useCallback((node: any) => {
    const displayName = getDisplayName(node);
    const displayElement = getTargetType(node) === 'search'
      ? <Link to={`/search/${getRecordClassUrlSegment(node)}/${node.wdkReference.urlSegment}`}>
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
      <h6>
        SPECIALIZED SEARCHES
      </h6> 
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
            linksPosition={LinksPosition.Top}
          />
      }
      <h4>
        What do you want to explore?
      </h4>
    </nav>
  );
};

const mapStateToProps = (state: RootState) => ({
  // FIXME: This is not typesafe
  searchTree: get(state.globalData, 'searchTree') as CategoryTreeNode
});

export const SearchPane = connect(mapStateToProps)(SearchPaneView);
