import { partition } from 'lodash';

import {
  makeClassNameHelper,
  safeHtml,
} from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { areTermsInString } from '@veupathdb/wdk-client/lib/Utils/SearchUtils';
import { TreeBoxVocabNode } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

const cx = makeClassNameHelper('OrganismNode');

export function getNodeId(node: TreeBoxVocabNode) {
  return node.data.term;
}

export function getNodeChildren(node: TreeBoxVocabNode) {
  return node.children;
}

export function makeOrganismSearchPredicate(
  referenceStrains: Set<string> | undefined
) {
  const shouldHighlightReferenceStrains = referenceStrains != null;

  return function (node: TreeBoxVocabNode, searchTerms: string[]) {
    const searchableString =
      shouldHighlightReferenceStrains && referenceStrains?.has(getNodeId(node))
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

interface OrganismNodeConfig {
  referenceStrains?: Set<string>;
  newOrganisms?: Set<string>;
}

export function makeRenderOrganismNode({
  referenceStrains,
  newOrganisms,
}: OrganismNodeConfig) {
  return function renderNode(node: TreeBoxVocabNode) {
    const organismName = getNodeId(node);
    const taxonDisplay = safeHtml(node.data.display);

    return (
      <div
        className={cx('--Container', newOrganisms?.has(organismName) && 'new')}
      >
        {taxonDisplay}
        {referenceStrains?.has(organismName) && (
          <span className="IsReferenceStrain">[Reference]</span>
        )}
      </div>
    );
  };
}
