import {
  getBranches,
  getLeaves,
  pruneDescendantNodes,
} from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { TreeBoxVocabNode } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import { getNodeChildren, getNodeId } from './organismNodes';

export function findAvailableOrganisms(organismTree: TreeBoxVocabNode) {
  const availableOrganismsList = getLeaves(organismTree, getNodeChildren).map(
    getNodeId
  );

  return new Set(availableOrganismsList);
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
