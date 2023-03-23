import { partial } from 'lodash';
import React, { FunctionComponent, useMemo } from 'react';
import { wrappable } from '../../Utils/ComponentUtils';
import {
  getNodeId,
  getChildren as getNodeChildren,
  nodeSearchPredicate,
  BasicNodeComponent,
  CategoryTreeNode,
} from '../../Utils/CategoryUtils';
import { makeSearchHelpText } from '../../Utils/SearchUtils';
import CheckboxTree, {
  LinksPosition,
  CheckboxTreeStyleSpec,
} from '@veupathdb/coreui/dist/components/inputs/checkboxes/CheckboxTree/CheckboxTree';
import {
  getFilteredNodeChildren,
  nodeSearchPredicateWithHiddenNodes,
} from '../../Utils/CheckboxTreeUtils';

const sharedCheckboxTreeContainerStyleSpec: React.CSSProperties = {
  position: 'relative',
  maxHeight: '75vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

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
  leafType: string; // do not make optional- add this prop to your calling code!
  selectedLeaves: string[];
  currentSelection?: string[];
  defaultSelection?: string[];
  expandedBranches: string[];
  searchTerm: string;
  searchIconName?: 'search' | 'filter';
  searchIconPosition?: 'left' | 'right';
  renderNode?: (node: CategoryTreeNode, path?: number[]) => React.ReactNode;
  isMultiPick?: boolean;
  onChange: ChangeHandler;
  onUiChange: ChangeHandler;
  onSearchTermChange: (term: string) => void;
  renderNoResults?: (
    searchTerm: string,
    tree: CategoryTreeNode
  ) => React.ReactNode;
  isSelectable?: boolean;
  disableHelp?: boolean;
  linksPosition?: LinksPosition;
  showSearchBox?: boolean;
  containerClassName?: string;
  styleOverrides?: CheckboxTreeStyleSpec;
  /**
   * Used to apply styling to a container that wraps the CheckboxTree
   * If omitted, the container uses the sharedCheckboxTreeContainerStyleSpec default styles
   */
  type?: 'headerMenu' | 'searchPane';
};

let CategoriesCheckboxTree: FunctionComponent<Props> = (props) => {
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
    searchIconName = 'filter',
    searchIconPosition = 'left',
    selectedLeaves,
    currentSelection,
    defaultSelection,
    title,
    tree,
    linksPosition,
    showSearchBox,
    containerClassName = '',
    styleOverrides = {},
    type,
  } = props;

  if (tree.children.length == 0) {
    return <noscript />;
  }

  // set help
  let searchBoxHelp = disableHelp
    ? ''
    : makeSearchHelpText(`each ${leafType} below`);

  const containerStyleSpec = useMemo(() => {
    return type === 'searchPane'
      ? {
          ...sharedCheckboxTreeContainerStyleSpec,
          borderBottom: '0.0625rem solid #694b66',
        }
      : type === 'headerMenu'
      ? {
          ...sharedCheckboxTreeContainerStyleSpec,
          minWidth: '18.75em',
        }
      : {
          ...sharedCheckboxTreeContainerStyleSpec,
        };
  }, [type]);

  return (
    <div className={`wdk-CategoriesCheckboxTree ${containerClassName}`}>
      {title && <h3 className="wdk-CategoriesCheckboxTreeHeading">{title}</h3>}
      <div style={containerStyleSpec}>
        <CheckboxTree<CategoryTreeNode>
          searchBoxHelp={searchBoxHelp}
          isSearchable={true}
          isSelectable={isSelectable}
          autoFocusSearchBox={autoFocusSearchBox}
          name={name}
          renderNoResults={renderNoResults}
          searchIconName={searchIconName}
          searchIconPosition={searchIconPosition}
          linksPosition={linksPosition}
          showSearchBox={showSearchBox}
          getNodeId={getNodeId}
          getNodeChildren={
            visibilityFilter
              ? getFilteredCategoryNodeChildren(visibilityFilter)
              : getNodeChildren
          }
          searchPredicate={
            visibilityFilter
              ? categoryNodeSearchPredicateWithHiddenNodes(visibilityFilter)
              : nodeSearchPredicate
          }
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
          styleOverrides={styleOverrides}
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
  disableHelp: false,
} as Props;

export default wrappable(CategoriesCheckboxTree);

const getFilteredCategoryNodeChildren = partial(
  getFilteredNodeChildren,
  getNodeChildren
);

const categoryNodeSearchPredicateWithHiddenNodes = partial(
  nodeSearchPredicateWithHiddenNodes,
  getNodeChildren,
  nodeSearchPredicate
);
