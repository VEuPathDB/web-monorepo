import React, { ComponentClass, StatelessComponent } from 'react';
import { wrappable } from '../../Utils/ComponentUtils';
import {
  getNodeId,
  getChildren as getNodeChildren,
  nodeSearchPredicate,
  BasicNodeComponent,
  CategoryTreeNode
} from '../../Utils/CategoryUtils';
import CheckboxTree from "./CheckboxTree";

type NodeComponentProps = {
  node: CategoryTreeNode
}

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
  nodeComponent?: ComponentClass<NodeComponentProps> | StatelessComponent<NodeComponentProps>;
  isMultiPick?: boolean;
  onChange: ChangeHandler;
  onUiChange: ChangeHandler;
  onSearchTermChange: (term: string) => void;
  noResultsComponent?: ComponentClass<{ tree: CategoryTreeNode, searchTerm: string }>
                    | StatelessComponent<{ tree: CategoryTreeNode, searchTerm: string }>
  isSelectable?: boolean;
  disableHelp?: boolean;
};

let CategoriesCheckboxTree: StatelessComponent<Props> = props => {

  let {
    title, name, autoFocusSearchBox, searchBoxPlaceholder, tree,
    selectedLeaves, expandedBranches, nodeComponent, isMultiPick, searchTerm,
    onChange, onUiChange, onSearchTermChange, isSelectable, leafType,
    disableHelp, noResultsComponent
  } = props;

  if (tree.children.length == 0) {
    return ( <noscript/> );
  }

  let treeProps = {

    // set help
    searchBoxHelp: disableHelp ? '' : `Each ${leafType} name will be searched. The ${leafType} names will contain all your terms. Your terms are partially matched; for example, the term typ will match typically, type, atypical.`,

    // set hard-coded values for searchable, selectable, expandable tree
    isSearchable: true, isSelectable, autoFocusSearchBox, name, noResultsComponent,
    searchIconName: 'filter', linkPlacement: CheckboxTree.LinkPlacement.Top,

    // set values from category utils since we know tree is a category tree
    getNodeId, getNodeChildren, searchPredicate: nodeSearchPredicate, nodeComponent,

    // set current data in the tree
    tree, isMultiPick, selectedList: selectedLeaves, expandedList: expandedBranches, searchBoxPlaceholder, searchTerm,

    // set event handlers
    onSelectionChange: onChange, onExpansionChange: onUiChange, onSearchTermChange
  };

  return (
    <div className="wdk-CategoriesCheckboxTree">
      {title && <h3 className="wdk-CategoriesCheckboxTreeHeading">{title}</h3>}
      <div className="wdk-CategoriesCheckboxTreeWrapper">
        <CheckboxTree {...treeProps} />
      </div>
    </div>
  );
};

CategoriesCheckboxTree.defaultProps = {
  nodeComponent: BasicNodeComponent,
  isMultiPick: true,
  isSelectable: true,
  leafType: 'column', // TODO remove once all consumers are passing in a value for this
  disableHelp: false
} as Props

export default wrappable(CategoriesCheckboxTree);
