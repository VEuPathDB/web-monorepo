import React, { useMemo } from 'react';
import { RecordTableProps, WrappedComponentProps } from './Types';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { PhyleticDistributionCheckbox } from 'ortho-client/components/phyletic-distribution/PhyleticDistributionCheckbox';
import { taxonCountsTableValueToMap } from './utils';
import { useTaxonUiMetadata } from 'ortho-client/hooks/taxons';

export interface Props extends WrappedComponentProps<RecordTableProps> {
  selectedSpecies: string[];
  onSpeciesSelected: (taxons: string[]) => void;
}

export function RecordTable_TaxonCounts_Filter({
  value,
  selectedSpecies,
  onSpeciesSelected,
}: Props) {
  const selectionConfig = useMemo(
    () =>
      ({
        selectable: true,
        onSpeciesSelected,
        selectedSpecies,
      } as const),
    [onSpeciesSelected, selectedSpecies]
  );

  const speciesCounts = useMemo(
    () => taxonCountsTableValueToMap(value),
    [value]
  );

  const taxonUiMetadata = useTaxonUiMetadata();

  return taxonUiMetadata == null ? (
    <Loading />
  ) : (
    <PhyleticDistributionCheckbox
      selectionConfig={selectionConfig}
      speciesCounts={speciesCounts}
      taxonTree={taxonUiMetadata.taxonTree}
    />
  );
}
