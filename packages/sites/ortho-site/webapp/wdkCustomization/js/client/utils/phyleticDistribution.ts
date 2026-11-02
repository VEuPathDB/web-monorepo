import { TaxonTree } from 'ortho-client/utils/taxons';

export interface PhyleticDistributionUiTree extends TaxonTree {
  children: PhyleticDistributionUiTree[];
  speciesCount: number;
  /** Like `speciesCount`, but from the unfiltered counts; decides what is hidden as absent. */
  presentCount: number;
}

export function getNodeChildren(node: PhyleticDistributionUiTree) {
  return node.children;
}
