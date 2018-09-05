import './TreeBoxParam.scss';

import { escapeRegExp, intersection } from 'lodash';
import React from 'react';

import CheckboxTree from '../../../../Components/CheckboxTree/CheckboxTree';
import Icon from '../../../../Components/Icon/IconAlt';
import { ParamInitAction } from '../../../../Core/ActionCreators/QuestionActionCreators';
import { makeActionCreator } from '../../../../Utils/ActionCreatorUtils';
import { safeHtml } from '../../../../Utils/ComponentUtils';
import { Seq } from '../../../../Utils/IterableUtils';
import { matchAction } from '../../../../Utils/ReducerUtils';
import { filterNodes, getLeaves, isBranch } from '../../../../Utils/TreeUtils';
import { Parameter, TreeBoxEnumParam, TreeBoxVocabNode } from '../../../../Utils/WdkModel';

import enumParamModule from '../EnumParam';
import SelectionInfo from '../EnumParam/SelectionInfo';
import { Context, Props } from '../Utils';

// Types
// -----

type Ctx = Context<TreeBoxEnumParam>;

type TreeBoxProps = Props<TreeBoxEnumParam, State>;

export type State = {
  expandedList: string[];
  searchTerm: string;
}


// ActionCreators
// --------------

export const ExpandedListSet = makeActionCreator<Ctx & {
    expandedList: string[]
  }, 'enum-param-treebox/expanded-list-set'>('enum-param-treebox/expanded-list-set')

export const SearchTermSet = makeActionCreator<
  Ctx & { searchTerm: string },
  'enum-param-treebox/search-term-set'
>('enum-param-treebox/search-term-set');


// Utils
// -----

export function isType(parameter: Parameter): parameter is TreeBoxEnumParam {
  return (
    enumParamModule.isType(parameter) &&
    parameter.displayType === 'treeBox'
  );
}

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

function removeBranches(tree: TreeBoxVocabNode, items: string[]) {
  const leaves = getLeaves(tree, getNodeChildren);
  return intersection(leaves.map(getNodeId), items);
}

function deriveSelectedBranches(tree: TreeBoxVocabNode, items: string[]) {
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

function deriveIndeterminateBranches(tree: TreeBoxVocabNode, items: string[]) {
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

export const reduce = matchAction({} as State,
  [ParamInitAction, (state, { parameter }) => ({
    expandedList: findBranchTermsUpToDepth(
      (parameter as TreeBoxEnumParam).vocabulary,
      (parameter as TreeBoxEnumParam).depthExpanded
    ),
    searchTerm: ''
  })],
  [ExpandedListSet, (state, { expandedList }) => ({
    ...state,
    expandedList: expandedList
  })],
  [SearchTermSet, (state, { searchTerm }) => ({
    ...state,
    searchTerm: searchTerm
  })]
);


// View
// ----


export function TreeBoxEnumParam(props: TreeBoxProps) {
  const tree = props.parameter.vocabulary;
  const selectedNodes = props.value.split(/\s*,\s*/);
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
        isMultiPick={props.parameter.multiPick}
        linksPosition={CheckboxTree.LinkPlacement.Bottom}
        showRoot={false}
        tree={tree}
        getNodeId={getNodeId}
        getNodeChildren={getNodeChildren}
        nodeComponent={VocabNodeRenderer}
        onExpansionChange={expandedList => props.dispatch(ExpandedListSet.create({ ...props.ctx, expandedList}))}
        expandedList={props.uiState.expandedList}
        selectedList={selectedLeaves}
        onSelectionChange={(ids: string[]) => {
          const idsWithBranches = ids.concat(deriveSelectedBranches(tree, ids));
          props.onParamValueChange(idsWithBranches.join(','));
        }}
        isSearchable={true}
        searchBoxPlaceholder="Filter list below..."
        searchIconName="filter"
        noResultsComponent={NoResults}
        searchTerm={props.uiState.searchTerm}
        searchPredicate={searchPredicate}
        onSearchTermChange={searchTerm => props.dispatch(SearchTermSet.create({ ...props.ctx, searchTerm }))}
      />
    </div>
  );
}

type VocabNodeRendererProps = {
  node: TreeBoxVocabNode;
}

function VocabNodeRenderer(props: VocabNodeRendererProps) {
  return safeHtml(props.node.data.display);
}

type NoResultsProps = {
  searchTerm: string;
}

function NoResults(props: NoResultsProps) {
  return (
    <div style={{ padding: '1em' }}>
      <Icon fa="warning"/> The string <strong>{props.searchTerm}</strong> did not match anything for this parameter.
    </div>
  )
}
