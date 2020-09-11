import { TaxonTree } from 'ortho-client/utils/taxons';

export interface PhyleticDistributionUiTree extends TaxonTree {
  children: PhyleticDistributionUiTree[];
  speciesCount: number;
}

export function getNodeChildren(node: PhyleticDistributionUiTree) {
  return node.children;
}
