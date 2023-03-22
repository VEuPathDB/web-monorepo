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
  referenceStrains?: Set<string>,
  newOrganisms?: Set<string>
) {
  const shouldHighlightReferenceStrains = referenceStrains != null;
  const shouldHighlightNewOrganisms = newOrganisms != null;

  return function (node: TreeBoxVocabNode, searchTerms: string[]) {
    const searchableSubstrings = [
      node.data.display,
      shouldHighlightReferenceStrains &&
        referenceStrains?.has(getNodeId(node)) &&
        'reference',
      shouldHighlightNewOrganisms &&
        newOrganisms?.has(getNodeId(node)) &&
        'new',
    ];

    const searchableString = searchableSubstrings.join(' ');

    const normalizedSearchTerms = makeNormalizedSearchTerms(
      searchTerms,
      shouldHighlightReferenceStrains,
      shouldHighlightNewOrganisms
    );

    return areTermsInString(normalizedSearchTerms, searchableString);
  };
}

function makeNormalizedSearchTerms(
  rawSearchTerms: string[],
  shouldHighlightReferenceStrains: boolean,
  shouldHighlightNewOrganisms: boolean
) {
  if (!shouldHighlightReferenceStrains && !shouldHighlightNewOrganisms) {
    return rawSearchTerms;
  }

  return rawSearchTerms.reduce((memo, rawSearchTerm) => {
    if ('[Reference]'.toLowerCase().includes(rawSearchTerm.toLowerCase())) {
      memo.push('reference');
    } else if ('[NEW]'.toLowerCase().includes(rawSearchTerm.toLowerCase())) {
      memo.push('new');
    } else {
      memo.push(rawSearchTerm);
    }

    return memo;
  }, [] as string[]);
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
        {newOrganisms?.has(organismName) && (
          <span className="IsNewOrganism">[NEW]</span>
        )}
      </div>
    );
  };
}
