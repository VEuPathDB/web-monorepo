import React, { useMemo } from 'react';
import { RecordTableProps, WrappedComponentProps } from './Types';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { PhyleticDistributionCheckbox } from 'ortho-client/components/phyletic-distribution/PhyleticDistributionCheckbox';
import { taxonCountsTableValueToMap } from './utils';
import { useTaxonUiMetadata } from 'ortho-client/hooks/taxons';
import { PopoverButtonProps } from '@veupathdb/coreui/lib/components/buttons/PopoverButton/PopoverButton';

export interface Props extends WrappedComponentProps<RecordTableProps> {
  selectedSpecies: string[];
  onSpeciesSelected: (taxons: string[]) => void;
  /** Optional to provide animated appear/disappear for popover button
   * provide either an integer milliseconds (appear and disappear)
   * or an object with separate timings: { enter: 300, exit: 600 }
   */
  transitionDuration?: PopoverButtonProps['transitionDuration'];
}

export function RecordTable_TaxonCounts_Filter({
  value,
  selectedSpecies,
  onSpeciesSelected,
  transitionDuration,
}: Props) {
  const selectionConfig = useMemo(
    () =>
      ({
        selectable: true,
        onSpeciesSelected,
        selectedSpecies,
        transitionDuration,
      } as const),
    [onSpeciesSelected, selectedSpecies, transitionDuration]
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
