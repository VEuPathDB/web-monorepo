import { partition } from 'lodash';

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

export function makeSearchPredicate(
  referenceStrains: Set<string>,
  shouldHighlightReferenceStrains: boolean
) {
  return function (node: TreeBoxVocabNode, searchTerms: string[]) {
    const searchableString =
      shouldHighlightReferenceStrains && referenceStrains.has(getNodeId(node))
        ? `${node.data.display} reference`
        : node.data.display;

    const normalizedSearchTerms = makeNormalizedSearchTerms(
      searchTerms,
      shouldHighlightReferenceStrains
    );

    return areTermsInString(normalizedSearchTerms, searchableString);
  };
}

function makeNormalizedSearchTerms(
  rawSearchTerms: string[],
  shouldHighlightReferenceStrains: boolean
) {
  if (!shouldHighlightReferenceStrains) {
    return rawSearchTerms;
  }

  const [
    referenceStrainSearchTerms,
    freeTextSearchTerms,
  ] = partition(rawSearchTerms, (rawSearchTerm) =>
    '[Reference]'.toLowerCase().includes(rawSearchTerm.toLowerCase())
  );

  const shouldIncludeReferenceStrains = referenceStrainSearchTerms.length > 0;

  return shouldIncludeReferenceStrains
    ? [...freeTextSearchTerms, 'reference']
    : freeTextSearchTerms;
}

export function makeRenderNode(
  referenceStrains: Set<string>,
  shouldHighlightReferenceStrains: boolean
) {
  return function renderNode(node: TreeBoxVocabNode) {
    const organismName = getNodeId(node);
    const taxonDisplay = safeHtml(node.data.display);

    return (
      <div>
        {taxonDisplay}
        {shouldHighlightReferenceStrains &&
          referenceStrains.has(organismName) && (
            <span className="IsReferenceStrain">[Reference]</span>
          )}
      </div>
    );
  };
}

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
