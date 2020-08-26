import React, { useMemo } from 'react';

import { Loading } from 'wdk-client/Components';
import { useSetDocumentTitle } from 'wdk-client/Utils/ComponentUtils';

import { OrthoDataTable } from 'ortho-client/components/OrthoDataTable';
import { useTaxonUiMetadata } from 'ortho-client/hooks/taxons';
import { useGenomeStatisticsRows } from 'ortho-client/hooks/dataSummary';
import { GenomeStatisticsRow, GenomeStatisticsRows } from 'ortho-client/utils/dataSummary';
import { DataTableColumns } from 'ortho-client/utils/dataTables';
import { TaxonUiMetadata } from 'ortho-client/utils/taxons';

export function GenomeStatisticsController() {
  useSetDocumentTitle('Release Summary - Genome Statistics');

  const rows = useDataTableRows();

  return rows == null
    ? <Loading />
    : <OrthoDataTable
        rows={rows}
        columns={GENOME_STATISTICS_COLUMNS}
        columnOrder={GENOME_STATISTICS_COLUMN_ORDER}
      />;
}

type GenomeStatisticsDataTableRow = GenomeStatisticsRow;

function useDataTableRows() {
  const taxonUiMetadata = useTaxonUiMetadata();
  const genomeStatisticsRows = useGenomeStatisticsRows();

  const rows = useMemo(
    () => (
      taxonUiMetadata &&
      genomeStatisticsRows &&
      makeDataTableRows(
        taxonUiMetadata,
        genomeStatisticsRows
      )
    ),
    [ taxonUiMetadata, genomeStatisticsRows ]
  );

  return rows;
}

function makeDataTableRows(
  { species }: TaxonUiMetadata,
  genomeStatisticsRows: GenomeStatisticsRows
): GenomeStatisticsDataTableRow[] {
  return genomeStatisticsRows.map(
    genomeStatisticsRow => ({
      ...genomeStatisticsRow,
      root_taxon: species[genomeStatisticsRow.three_letter_abbrev].rootTaxon
    })
  );
}

const GENOME_STATISTICS_COLUMNS: DataTableColumns<
  GenomeStatisticsDataTableRow,
  | 'clustered_sequences'
  | 'core_peripheral'
  | 'groups'
  | 'name'
  | 'root_taxon'
  | 'sequences'
  | 'three_letter_abbrev'
> = {
  clustered_sequences: {
    key: 'clustered_sequences',
    name: '# Clustered Sequences',
    sortable: true,
    makeOrder: ({ clustered_sequences }) => Number(clustered_sequences)
  },
  core_peripheral: {
    key: 'core_peripheral',
    name: 'Core/Peripheral',
    sortable: true
  },
  groups: {
    key: 'groups',
    name: '# Groups',
    sortable: true,
    makeOrder: ({ groups }) => Number(groups)
  },
  name: {
    key: 'name',
    name: 'Name',
    sortable: true
  },
  root_taxon: {
    key: 'root_taxon',
    name: 'Category',
    sortable: true
  },
  sequences: {
    key: 'sequences',
    name: '# Sequences',
    sortable: true,
    makeOrder: ({ sequences }) => Number(sequences)
  },
  three_letter_abbrev: {
    key: 'three_letter_abbrev',
    name: 'Abbreviation',
    sortable: true
  }
};

const GENOME_STATISTICS_COLUMN_ORDER = [
  'root_taxon',
  'name',
  'core_peripheral',
  'three_letter_abbrev',
  'sequences',
  'clustered_sequences',
  'groups'
] as const;
