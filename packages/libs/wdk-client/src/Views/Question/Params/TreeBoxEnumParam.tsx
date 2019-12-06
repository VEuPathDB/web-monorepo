import 'wdk-client/Views/Question/Params/TreeBoxParam.scss';

import { escapeRegExp, intersection } from 'lodash';
import React from 'react';

import CheckboxTree from 'wdk-client/Components/CheckboxTree/CheckboxTree';
import Icon from 'wdk-client/Components/Icon/IconAlt';
import { safeHtml } from 'wdk-client/Utils/ComponentUtils';
import { Seq } from 'wdk-client/Utils/IterableUtils';
import { filterNodes, getLeaves, isBranch } from 'wdk-client/Utils/TreeUtils';
import { EnumParam, TreeBoxEnumParam, TreeBoxVocabNode } from 'wdk-client/Utils/WdkModel';

import SelectionInfo from 'wdk-client/Views/Question/Params/SelectionInfo';
import { Context } from 'wdk-client/Views/Question/Params/Utils';
import { isMultiPick, isEnumParam } from 'wdk-client/Views/Question/Params/EnumParamUtils';
import { INIT_PARAM } from 'wdk-client/Actions/QuestionActions';
import {
  setExpandedList,
  setSearchTerm,
  SET_EXPANDED_LIST,
  SET_SEARCH_TERM
} from 'wdk-client/Actions/TreeBoxEnumParamActions';
import { Action } from 'wdk-client/Actions';
import { DispatchAction } from 'wdk-client/Core/CommonTypes';

// Types
// -----

export type State = {
  expandedList: string[];
  searchTerm: string;
}

type TreeBoxProps = {
  parameter: TreeBoxEnumParam;
  selectedValues: string[];
  onChange: (newValue: string[]) => void;
  uiState: State;
  context: Context<TreeBoxEnumParam>;
  dispatch: DispatchAction;
}



// Utils
// -----

function searchPredicate(node: TreeBoxVocabNode, searchTerms: string[]) {
  return searchTerms
    .map(term => new RegExp(escapeRegExp(term), 'i'))
    .every(re => re.test(node.data.display));
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

function deriveSelectedBranches(tree: TreeBoxVocabNode, items: string[]): string[] {
  const itemSet = new Set(items);
  return filterNodes((node: TreeBoxVocabNode) => (
    isBranch(node, getNodeChildren) &&
    node.children.every(child => itemSet.has(child.data.term))
  ), tree)
    .map((node: TreeBoxVocabNode) => node.data.term);
}

function findBranchTermsUpToDepth(tree: TreeBoxVocabNode, depth: number): string[] {
  if (depth === 0) return [];
  return Seq.from(tree.children)
    .flatMap(node => [ node.data.term, ...findBranchTermsUpToDepth(node, depth - 1)])
    .toArray();
}

function deriveIndeterminateBranches(tree: TreeBoxVocabNode, items: string[]): string[] {
  const itemSet = new Set(items);
  return filterNodes((node: TreeBoxVocabNode) => (
    isBranch(node, getNodeChildren) &&
    node.children.some(child => itemSet.has(child.data.term)) &&
    node.children.some(child => !itemSet.has(child.data.term))
  ), tree)
  .map((node: TreeBoxVocabNode) => node.data.term);
}


// Reducer
// -------

export function reduce(state: State = {} as State, action: Action): State {
  switch(action.type) {

    case INIT_PARAM:
      let { parameter } = action.payload;
      if (isEnumParam(parameter) && parameter.displayType == 'treeBox') {
        return {
          expandedList: findBranchTermsUpToDepth(
            parameter.vocabulary,
            parameter.depthExpanded
          ),
          searchTerm: ''
        };
      }
      return state;

    case SET_EXPANDED_LIST:
      return {
        ...state,
        expandedList: action.payload.expandedList
      };

    case SET_SEARCH_TERM:
      return {
        ...state,
        searchTerm: action.payload.searchTerm
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
  const selectedLeaves = removeBranches(tree, selectedNodes);
  const allCount = getLeaves(tree, getNodeChildren).length;
  const selectedCount = props.parameter.countOnlyLeaves
    ? selectedLeaves.length
    : selectedNodes.length;

  return (
    <div className="wdk-TreeBoxParam">
      <SelectionInfo parameter={props.parameter} selectedCount={selectedCount} allCount={allCount} alwaysShowCount />
      <CheckboxTree
        isSelectable={true}
        isMultiPick={isMultiPick(props.parameter)}
        linksPosition={CheckboxTree.LinkPlacement.Bottom}
        showRoot={false}
        tree={tree}
        getNodeId={getNodeId}
        getNodeChildren={getNodeChildren}
        renderNode={renderNode}
        onExpansionChange={expandedList => props.dispatch(setExpandedList({ ...props.context, expandedList}))}
        expandedList={props.uiState.expandedList}
        selectedList={selectedLeaves}
        onSelectionChange={(ids: string[]) => {
          const idsWithBranches = ids.concat(deriveSelectedBranches(tree, ids));
          props.onChange(idsWithBranches);
        }}
        isSearchable={true}
        searchBoxPlaceholder="Filter list below..."
        searchIconName="filter"
        renderNoResults={renderNoResults}
        searchTerm={props.uiState.searchTerm}
        searchPredicate={searchPredicate}
        onSearchTermChange={searchTerm => props.dispatch(setSearchTerm({ ...props.context, searchTerm }))}
      />
    </div>
  );
}

function renderNode(node: TreeBoxVocabNode) {
  return safeHtml(node.data.display);
}

function renderNoResults(searchTerm: string) {
  return (
    <div style={{ padding: '1em' }}>
      <Icon fa="warning"/> The string <strong>{searchTerm}</strong> did not match anything for this parameter.
    </div>
  )
}

export default TreeBoxEnumParamComponent;
