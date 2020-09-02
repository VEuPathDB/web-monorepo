import React, { useMemo } from 'react';

import { Loading } from 'wdk-client/Components';
import { useSetDocumentTitle } from 'wdk-client/Utils/ComponentUtils';

import { ReleaseSummaryPage } from 'ortho-client/components/release-summary/ReleaseSummaryPage';
import { useTaxonUiMetadata } from 'ortho-client/hooks/taxons';
import { useGenomeStatisticsRows } from 'ortho-client/hooks/dataSummary';
import {
  COMMON_RELEASE_SUMMARY_COLUMNS,
  GenomeStatisticsRow,
  makeDataTableRows
} from 'ortho-client/utils/dataSummary';
import { DataTableColumns } from 'ortho-client/utils/dataTables';

export function GenomeStatisticsController() {
  useSetDocumentTitle('Release Summary - Genome Statistics');

  const rows = useDataTableRows();

  return rows == null
    ? <Loading />
    : <ReleaseSummaryPage
        header="Genome Statistics"
        rows={rows}
        columns={GENOME_STATISTICS_COLUMNS}
        columnOrder={GENOME_STATISTICS_COLUMN_ORDER}
      />;
}

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

const GENOME_STATISTICS_COLUMNS: DataTableColumns<
  GenomeStatisticsRow,
  keyof GenomeStatisticsRow
> = {
  ...COMMON_RELEASE_SUMMARY_COLUMNS,
  clustered_sequences: {
    key: 'clustered_sequences',
    name: '# Clustered Sequences',
    sortable: true,
    makeOrder: ({ clustered_sequences }) => Number(clustered_sequences)
  },
  groups: {
    key: 'groups',
    name: '# Groups',
    sortable: true,
    makeOrder: ({ groups }) => Number(groups)
  },
  sequences: {
    key: 'sequences',
    name: '# Sequences',
    sortable: true,
    makeOrder: ({ sequences }) => Number(sequences)
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
