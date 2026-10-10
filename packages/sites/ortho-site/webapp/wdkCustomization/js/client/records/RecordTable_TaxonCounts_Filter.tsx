import React, { useMemo } from 'react';
import { RecordTableProps, WrappedComponentProps } from './Types';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { PhyleticDistributionCheckbox } from 'ortho-client/components/phyletic-distribution/PhyleticDistributionCheckbox';
import { taxonCountsTableValueToMap } from './utils';
import { useTaxonUiMetadata } from 'ortho-client/hooks/taxons';

export interface Props extends WrappedComponentProps<RecordTableProps> {
  selectedSpecies: string[];
  onSpeciesSelected: (taxons: string[]) => void;
  /**
   * Optional counts to display (species abbrev to count), e.g. counts that
   * follow the table's filters. Which organisms are listed at all still
   * comes from the group's `TaxonCounts` table in `value`.
   */
  speciesCounts?: Record<string, number>;
  /** Optional. When true, popover (if using) closing will be deferred until this becomes false */
  deferPopoverClosing?: boolean;
}

export function RecordTable_TaxonCounts_Filter({
  value,
  speciesCounts: displayedCounts,
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

  const groupSpeciesCounts = useMemo(
    () => taxonCountsTableValueToMap(value),
    [value]
  );

  const taxonUiMetadata = useTaxonUiMetadata();

  return taxonUiMetadata == null ? (
    <Loading />
  ) : (
    <PhyleticDistributionCheckbox
      selectionConfig={selectionConfig}
      speciesCounts={displayedCounts ?? groupSpeciesCounts}
      presenceCounts={groupSpeciesCounts}
      taxonTree={taxonUiMetadata.taxonTree}
    />
  );
}
