import { once } from 'lodash';

import {
  TaxonEntries,
  TaxonUiMetadata,
  makeTaxonTree,
  makeTaxonUiMetadata,
} from 'ortho-client/utils/taxons';

import { useOrthoService } from 'ortho-client/hooks/orthoService';

export function useTaxonEntries(): TaxonEntries | undefined {
  return useOrthoService((orthoService) => orthoService.getTaxons(), []);
}

const memoizedTaxonTreeMaker = once(makeTaxonTree);
const memoizedTaxonUiMetadataMaker = once(makeTaxonUiMetadata);

export function useTaxonUiMetadata(): TaxonUiMetadata | undefined {
  const taxonEntries = useTaxonEntries();

  return taxonEntries == null
    ? undefined
    : memoizedTaxonUiMetadataMaker(
        taxonEntries,
        memoizedTaxonTreeMaker(taxonEntries)
      );
}
