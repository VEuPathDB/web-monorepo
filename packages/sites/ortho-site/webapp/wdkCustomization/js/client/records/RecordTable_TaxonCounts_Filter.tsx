import React, { useMemo } from 'react';
import { RecordTableProps, WrappedComponentProps } from './Types';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { PhyleticDistributionCheckbox } from 'ortho-client/components/phyletic-distribution/PhyleticDistributionCheckbox';
import { taxonCountsTableValueToMap } from './utils';
import { useTaxonUiMetadata } from 'ortho-client/hooks/taxons';

export interface Props extends WrappedComponentProps<RecordTableProps> {
  selectedSpecies: string[];
  onSpeciesSelected: (taxons: string[]) => void;
  /** Optional. When true, popover (if using) closing will be deferred until this becomes false */
  deferPopoverClosing?: boolean;
}

export function RecordTable_TaxonCounts_Filter({
  value,
  selectedSpecies,
  onSpeciesSelected,
  deferPopoverClosing,
}: Props) {
  const selectionConfig = useMemo(
    () =>
      ({
        selectable: true,
        onSpeciesSelected,
        selectedSpecies,
        deferPopoverClosing,
      } as const),
    [onSpeciesSelected, selectedSpecies, deferPopoverClosing]
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
