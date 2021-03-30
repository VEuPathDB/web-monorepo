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

export function makeConfigSearchPredicate(referenceStrains: Set<string>) {
  return function (node: TreeBoxVocabNode, searchTerms: string[]) {
    const searchableString = !referenceStrains.has(node.data.term)
      ? node.data.display
      : `${node.data.display} reference`;

    return areTermsInString(searchTerms, searchableString);
  };
}

export function makeConfigRenderNode(referenceStrains: Set<string>) {
  return function configRenderNode(node: TreeBoxVocabNode) {
    const organismName = node.data.term;
    const taxonDisplay = safeHtml(node.data.display);

    return (
      <div>
        {taxonDisplay}
        {referenceStrains.has(organismName) && (
          <span className="IsReferenceStrain">[Reference]</span>
        )}
      </div>
    );
  };
}

export function previewRenderNode(node: TreeBoxVocabNode) {
  return safeHtml(node.data.display);
}

export function findAvailableOrganisms(organismTree: TreeBoxVocabNode) {
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
