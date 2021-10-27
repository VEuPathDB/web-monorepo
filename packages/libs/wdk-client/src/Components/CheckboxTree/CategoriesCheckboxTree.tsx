import { partial } from 'lodash';
import React, { FunctionComponent } from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import {
  getNodeId,
  getChildren as getNodeChildren,
  nodeSearchPredicate,
  BasicNodeComponent,
  CategoryTreeNode
} from 'wdk-client/Utils/CategoryUtils';
import { makeSearchHelpText } from 'wdk-client/Utils/SearchUtils';
import CheckboxTree, { LinksPosition } from 'wdk-client/Components/CheckboxTree/CheckboxTree';
import { getFilteredNodeChildren, nodeSearchPredicateWithHiddenNodes } from 'wdk-client/Utils/CheckboxTreeUtils';

type ChangeHandler = (ids: string[]) => void;

type NodePredicate = (node: CategoryTreeNode) => boolean;

type Props = {
  title?: string;
  name?: string;
  /** Hide nodes for which predicate function returns false */
  visibilityFilter?: NodePredicate;
  autoFocusSearchBox?: boolean;
  searchBoxPlaceholder: string;
  tree: CategoryTreeNode;
  /** String name representing what is being searched */
  leafType: string, // do not make optional- add this prop to your calling code!
  selectedLeaves: string[];
  currentSelection?: string[];
  defaultSelection?: string[];
  expandedBranches: string[];
  searchTerm: string;
  renderNode?: (node: CategoryTreeNode, path?: number[]) => React.ReactNode;
  isMultiPick?: boolean;
  onChange: ChangeHandler;
  onUiChange: ChangeHandler;
  onSearchTermChange: (term: string) => void;
  renderNoResults?: (searchTerm: string, tree: CategoryTreeNode) => React.ReactNode;
  isSelectable?: boolean;
  disableHelp?: boolean;
  linksPosition?: LinksPosition;
  showSearchBox?: boolean;
  containerClassName?: string;
};

let CategoriesCheckboxTree: FunctionComponent<Props> = props => {

let {
  autoFocusSearchBox,
  disableHelp,
  expandedBranches,
  visibilityFilter,
  isMultiPick,
  isSelectable,
  leafType,
  name,
  onChange,
  onSearchTermChange,
  onUiChange,
  renderNoResults,
  renderNode,
  searchBoxPlaceholder,
  searchTerm,
  selectedLeaves,
  currentSelection,
  defaultSelection,
  title,
  tree,
  linksPosition,
  showSearchBox,
  containerClassName = ''
} = props;

  if (tree.children.length == 0) {
    return ( <noscript/> );
  }

  // set help
  let searchBoxHelp = disableHelp ? '' : makeSearchHelpText(`each ${leafType} below`);

  return (
    <div className={`wdk-CategoriesCheckboxTree ${containerClassName}`}>
      {title && <h3 className="wdk-CategoriesCheckboxTreeHeading">{title}</h3>}
      <div className="wdk-CategoriesCheckboxTreeWrapper">
        <CheckboxTree<CategoryTreeNode>
          searchBoxHelp={searchBoxHelp}
          isSearchable={true}
          isSelectable={isSelectable}
          autoFocusSearchBox={autoFocusSearchBox}
          name={name}
          renderNoResults={renderNoResults}
          searchIconName="filter"
          linksPosition={linksPosition}
          showSearchBox={showSearchBox}
          getNodeId={getNodeId}
          getNodeChildren={visibilityFilter ? getFilteredCategoryNodeChildren(visibilityFilter) : getNodeChildren}
          searchPredicate={visibilityFilter ? categoryNodeSearchPredicateWithHiddenNodes(visibilityFilter) : nodeSearchPredicate}
          renderNode={renderNode}
          tree={tree}
          isMultiPick={isMultiPick}
          selectedList={selectedLeaves}
          currentList={currentSelection}
          defaultList={defaultSelection}
          expandedList={expandedBranches}
          searchBoxPlaceholder={searchBoxPlaceholder}
          searchTerm={searchTerm}
          onSelectionChange={onChange}
          onExpansionChange={onUiChange}
          onSearchTermChange={onSearchTermChange}
        /> 
      </div>
    </div>
  );
};

CategoriesCheckboxTree.defaultProps = {
  renderNode: (node: CategoryTreeNode) => <BasicNodeComponent node={node} />,
  isMultiPick: true,
  isSelectable: true,
  leafType: 'column', // TODO remove once all consumers are passing in a value for this
  disableHelp: false
} as Props

export default wrappable(CategoriesCheckboxTree);

const getFilteredCategoryNodeChildren = partial(getFilteredNodeChildren, getNodeChildren);

const categoryNodeSearchPredicateWithHiddenNodes = partial(
  nodeSearchPredicateWithHiddenNodes,
  getNodeChildren,
  nodeSearchPredicate
);
