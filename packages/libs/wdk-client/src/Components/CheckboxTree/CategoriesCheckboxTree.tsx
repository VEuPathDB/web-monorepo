import React, { ComponentClass, StatelessComponent } from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import {
  getNodeId,
  getChildren as getNodeChildren,
  nodeSearchPredicate,
  BasicNodeComponent,
  CategoryTreeNode
} from 'wdk-client/Utils/CategoryUtils';
import CheckboxTree from 'wdk-client/Components/CheckboxTree/CheckboxTree';

// This allows us to specify the generic type in CheckboxTree
class RefinedCheckboxTree extends CheckboxTree<CategoryTreeNode> {}

type ChangeHandler = (ids: string[]) => void;

type Props = {
  title: string;
  name?: string;
  autoFocusSearchBox?: boolean;
  searchBoxPlaceholder: string;
  tree: CategoryTreeNode;
  /** String name representing what is being searched */
  leafType: string, // do not make optional- add this prop to your calling code!
  selectedLeaves: string[];
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
};

let CategoriesCheckboxTree: StatelessComponent<Props> = props => {

  let {
    title, name, autoFocusSearchBox, searchBoxPlaceholder, tree,
    selectedLeaves, expandedBranches, renderNode, isMultiPick, searchTerm,
    onChange, onUiChange, onSearchTermChange, isSelectable, leafType,
    disableHelp, renderNoResults
  } = props;

  if (tree.children.length == 0) {
    return ( <noscript/> );
  }

  // set help
  let searchBoxHelp = disableHelp ? '' : 
    `Each ${leafType} name will be searched. The ${leafType} names will contain all your terms. Your terms are partially matched; for example, the term typ will match typically, type, atypical.`;

  return (
    <div className="wdk-CategoriesCheckboxTree">
      {title && <h3 className="wdk-CategoriesCheckboxTreeHeading">{title}</h3>}
      <div className="wdk-CategoriesCheckboxTreeWrapper">
        <RefinedCheckboxTree
          searchBoxHelp={searchBoxHelp}
          isSearchable={true}
          isSelectable={isSelectable}
          autoFocusSearchBox={autoFocusSearchBox}
          name={name}
          renderNoResults={renderNoResults}
          searchIconName="filter"
          linkPlacement={CheckboxTree.LinkPlacement.Top}
          getNodeId={getNodeId}
          getNodeChildren={getNodeChildren}
          searchPredicate={nodeSearchPredicate}
          renderNode={renderNode}
          tree={tree}
          isMultiPick={isMultiPick}
          selectedList={selectedLeaves}
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
