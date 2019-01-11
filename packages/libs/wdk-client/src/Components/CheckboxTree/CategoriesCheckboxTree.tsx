import { negate } from 'lodash';
import React, { ComponentClass, StatelessComponent } from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import {
  getNodeId,
  getChildren as getNodeChildren,
  isIndividual,
  nodeSearchPredicate,
  BasicNodeComponent,
  CategoryTreeNode
} from 'wdk-client/Utils/CategoryUtils';
import CheckboxTree from 'wdk-client/Components/CheckboxTree/CheckboxTree';

type ChangeHandler = (ids: string[]) => void;

type Props = {
  title: string;
  name?: string;
  /** Hide individuals from the rendered tree. They will still affect searches. */
  hideIndividuals?: boolean;
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
  autoFocusSearchBox,
  disableHelp,
  expandedBranches,
  hideIndividuals,
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
  title,
  tree,
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
        <CheckboxTree<CategoryTreeNode>
          searchBoxHelp={searchBoxHelp}
          isSearchable={true}
          isSelectable={isSelectable}
          autoFocusSearchBox={autoFocusSearchBox}
          name={name}
          renderNoResults={renderNoResults}
          searchIconName="filter"
          linkPlacement={CheckboxTree.LinkPlacement.Top}
          getNodeId={getNodeId}
          getNodeChildren={hideIndividuals ? getNodeChildrenWithHiddenIndividuals : getNodeChildren}
          searchPredicate={hideIndividuals ? nodeSearchPredicateWithHiddenIndividuals : nodeSearchPredicate}
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
  hideIndividuals: false,
  isMultiPick: true,
  isSelectable: true,
  leafType: 'column', // TODO remove once all consumers are passing in a value for this
  disableHelp: false
} as Props

export default wrappable(CategoriesCheckboxTree);

function getNodeChildrenWithHiddenIndividuals(node: CategoryTreeNode) {
  return getNodeChildren(node).filter(negate(isIndividual));
}

function nodeSearchPredicateWithHiddenIndividuals(node: CategoryTreeNode, searchQueryTerms: string[]) {
  return (
    nodeSearchPredicate(node, searchQueryTerms) ||
    getNodeChildren(node)
      .filter(isIndividual)
      .some(node => nodeSearchPredicate(node, searchQueryTerms))
  );
}
