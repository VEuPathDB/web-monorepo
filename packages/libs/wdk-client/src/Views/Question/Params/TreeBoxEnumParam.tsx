import '../../../Views/Question/Params/TreeBoxParam.scss';

import { intersection } from 'lodash';
import React, { useCallback, useMemo } from 'react';

import CheckboxTree, {
  CheckboxTreeProps,
  LinksPosition,
} from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxTree/CheckboxTree';
import Icon from '../../../Components/Icon/IconAlt';
import { safeHtml } from '../../../Utils/ComponentUtils';
import { Seq } from '../../../Utils/IterableUtils';
import {
  areTermsInString,
  makeSearchHelpText,
} from '../../../Utils/SearchUtils';
import { filterNodes, getLeaves, isBranch } from '../../../Utils/TreeUtils';
import { TreeBoxEnumParam, TreeBoxVocabNode } from '../../../Utils/WdkModel';

import SelectionInfo from '../../../Views/Question/Params/SelectionInfo';
import { Context } from '../../../Views/Question/Params/Utils';
import {
  isMultiPick,
  isEnumParam,
} from '../../../Views/Question/Params/EnumParamUtils';
import { INIT_PARAM } from '../../../Actions/QuestionActions';
import {
  setExpandedList,
  setSearchTerm,
  SET_EXPANDED_LIST,
  SET_SEARCH_TERM,
} from '../../../Actions/TreeBoxEnumParamActions';
import { Action } from '../../../Actions';
import { DispatchAction } from '../../../Core/CommonTypes';

// Types
// -----

export type State = {
  expandedList: string[];
  searchTerm: string;
};

export type TreeBoxProps = {
  parameter: TreeBoxEnumParam;
  selectedValues: string[];
  onChange: (newValue: string[]) => void;
  uiState: State;
  context: Context<TreeBoxEnumParam>;
  dispatch: DispatchAction;
  wrapCheckboxTreeProps?: (
    props: CheckboxTreeProps<TreeBoxVocabNode>
  ) => CheckboxTreeProps<TreeBoxVocabNode>;
};

// Utils
// -----

function searchPredicate(node: TreeBoxVocabNode, searchTerms: string[]) {
  return areTermsInString(searchTerms, node.data.display);
}

function getNodeId(node: TreeBoxVocabNode) {
  return node.data.term;
}

function getNodeChildren(node: TreeBoxVocabNode) {
  return node.children;
}

function removeBranches(tree: TreeBoxVocabNode, items: string[]): string[] {
  const leaves = getLeaves(tree, getNodeChildren);
  return intersection(leaves.map(getNodeId), items);
}

function deriveSelectedBranches(
  tree: TreeBoxVocabNode,
  items: string[]
): string[] {
  const itemSet = new Set(items);
  return filterNodes(
    (node: TreeBoxVocabNode) =>
      // never include root node
      node !== tree &&
      isBranch(node, getNodeChildren) &&
      node.children.every((child) => itemSet.has(child.data.term)),
    tree
  ).map((node: TreeBoxVocabNode) => node.data.term);
}

function findBranchTermsUpToDepth(
  tree: TreeBoxVocabNode,
  depth: number
): string[] {
  if (depth === 0) return [];
  return Seq.from(tree.children)
    .flatMap((node) => [
      node.data.term,
      ...findBranchTermsUpToDepth(node, depth - 1),
    ])
    .toArray();
}

function deriveIndeterminateBranches(
  tree: TreeBoxVocabNode,
  items: string[]
): string[] {
  const itemSet = new Set(items);
  return filterNodes(
    (node: TreeBoxVocabNode) =>
      isBranch(node, getNodeChildren) &&
      node.children.some((child) => itemSet.has(child.data.term)) &&
      node.children.some((child) => !itemSet.has(child.data.term)),
    tree
  ).map((node: TreeBoxVocabNode) => node.data.term);
}

// Reducer
// -------

export function reduce(state: State = {} as State, action: Action): State {
  switch (action.type) {
    case INIT_PARAM:
      let { parameter } = action.payload;
      if (isEnumParam(parameter) && parameter.displayType == 'treeBox') {
        const depthExpanded =
          parameter.depthExpanded >= 1
            ? parameter.depthExpanded
            : parameter.vocabulary.children.length === 1
            ? 1
            : 0;

        return {
          expandedList: findBranchTermsUpToDepth(
            parameter.vocabulary,
            depthExpanded
          ),
          searchTerm: '',
        };
      }
      return state;

    case SET_EXPANDED_LIST:
      return {
        ...state,
        expandedList: action.payload.expandedList,
      };

    case SET_SEARCH_TERM:
      return {
        ...state,
        searchTerm: action.payload.searchTerm,
      };

    default:
      return state;
  }
}

// View
// ----

export function TreeBoxEnumParamComponent(props: TreeBoxProps) {
  const tree = props.parameter.vocabulary;
  const selectedNodes = props.selectedValues;
  const selectedLeaves = useSelectedLeaves(tree, selectedNodes);

  const selectionCounts = useSelectionCounts(
    props.parameter.countOnlyLeaves,
    tree,
    selectedLeaves,
    selectedNodes
  );

  const checkboxTreeProps = useDefaultCheckboxTreeProps(
    props,
    tree,
    selectedLeaves
  );
  const wrappedCheckboxTreeProps =
    props.wrapCheckboxTreeProps == null
      ? checkboxTreeProps
      : props.wrapCheckboxTreeProps(checkboxTreeProps);

  return (
    <div className="wdk-TreeBoxParam">
      <SelectionInfo
        parameter={props.parameter}
        {...selectionCounts}
        alwaysShowCount
      />
      <CheckboxTree {...wrappedCheckboxTreeProps} />
    </div>
  );
}

function renderNode(node: TreeBoxVocabNode) {
  return safeHtml(node.data.display);
}

function renderNoResults(searchTerm: string) {
  return (
    <div style={{ padding: '1em' }}>
      <Icon fa="warning" /> The string <strong>{searchTerm}</strong> did not
      match anything for this parameter.
    </div>
  );
}

export default TreeBoxEnumParamComponent;

export function useSelectedLeaves(
  tree: TreeBoxVocabNode,
  selectedNodes: string[]
) {
  return useMemo(
    () => removeBranches(tree, selectedNodes),
    [tree, selectedNodes]
  );
}

export function useSelectionCounts(
  countOnlyLeaves: boolean,
  tree: TreeBoxVocabNode,
  selectedLeaves: string[],
  selectedNodes: string[]
) {
  const allCount = useMemo(
    () => getLeaves(tree, getNodeChildren).length,
    [tree]
  );

  return {
    allCount,
    selectedCount: findSelectedCount(
      countOnlyLeaves,
      selectedLeaves.length,
      selectedNodes.length
    ),
  };
}

function findSelectedCount(
  countOnlyLeaves: boolean,
  selectedLeavesCount: number,
  selectedNodesCount: number
) {
  return countOnlyLeaves ? selectedLeavesCount : selectedNodesCount;
}

export function useDefaultCheckboxTreeProps(
  props: TreeBoxProps,
  tree: TreeBoxVocabNode,
  selectedLeaves: string[]
): CheckboxTreeProps<TreeBoxVocabNode> {
  const multiPick =
    isMultiPick(props.parameter) && props.parameter.maxSelectedCount !== 1;
  const handleExpansionChange = useCallback(
    (expandedList: string[]) => {
      props.dispatch(setExpandedList({ ...props.context, expandedList }));
    },
    [props.dispatch, props.context]
  );
  const handleSelectionChange = useCallback(
    (ids: string[]) => {
      const idsWithBranches = multiPick
        ? ids.concat(deriveSelectedBranches(tree, ids))
        : ids;
      props.onChange(idsWithBranches);
    },
    [props.onChange, tree]
  );
  const handleSearchTermChange = useCallback(
    (searchTerm: string) => {
      props.dispatch(setSearchTerm({ ...props.context, searchTerm }));
    },
    [props.dispatch, props.context]
  );

  return {
    isSelectable: true,
    isMultiPick: multiPick,
    linksPosition: LinksPosition.Top,
    showRoot: false,
    shouldExpandDescendantsWithOneChild: false,
    tree,
    getNodeId,
    getNodeChildren,
    renderNode,
    onExpansionChange: handleExpansionChange,
    expandedList: props.uiState.expandedList,
    selectedList: selectedLeaves,
    onSelectionChange: handleSelectionChange,
    isSearchable: true,
    searchBoxPlaceholder: 'Filter list below...',
    searchBoxHelp: makeSearchHelpText('the list below'),
    searchIconName: 'filter',
    searchIconPosition: 'right',
    renderNoResults,
    searchTerm: props.uiState.searchTerm,
    searchPredicate,
    onSearchTermChange: handleSearchTermChange,
  };
}
