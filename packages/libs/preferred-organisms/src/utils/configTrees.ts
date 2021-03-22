import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { areTermsInString } from '@veupathdb/wdk-client/lib/Utils/SearchUtils';
import {
  getBranches,
  getLeaves,
  pruneDescendantNodes,
} from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { TreeBoxVocabNode } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

export function getNodeId(node: TreeBoxVocabNode) {
  return node.data.term;
}

export function getNodeChildren(node: TreeBoxVocabNode) {
  return node.children;
}

export function searchPredicate(node: TreeBoxVocabNode, searchTerms: string[]) {
  return areTermsInString(searchTerms, node.data.display);
}

export function renderNode(node: TreeBoxVocabNode) {
  return safeHtml(node.data.display);
}

export function makeInitialConfigSelection(organismTree: TreeBoxVocabNode) {
  return getLeaves(organismTree, getNodeChildren).map(getNodeId);
}

export function makePreviewTree(
  organismTree: TreeBoxVocabNode,
  configSelection: string[]
) {
  const configSelectionSet = new Set(configSelection);

  return pruneDescendantNodes(
    (node) =>
      node.children.length > 0 || configSelectionSet.has(getNodeId(node)),
    organismTree
  );
}

export function makeInitialPreviewExpansion(organismTree: TreeBoxVocabNode) {
  return getBranches(organismTree, getNodeChildren).map(getNodeId);
}
