import React, { useMemo } from 'react';

import { Loading } from 'wdk-client/Components';
import { useSetDocumentTitle } from 'wdk-client/Utils/ComponentUtils';

import { ReleaseSummaryPage } from 'ortho-client/components/release-summary/ReleaseSummaryPage';
import { useTaxonUiMetadata } from 'ortho-client/hooks/taxons';
import { useGenomeSourcesRows } from 'ortho-client/hooks/dataSummary';
import {
  COMMON_RELEASE_SUMMARY_COLUMNS,
  GenomeSourcesRow,
  makeDataTableRows
} from 'ortho-client/utils/dataSummary';
import { DataTableColumns } from 'ortho-client/utils/dataTables';

export function GenomeSourcesController() {
  useSetDocumentTitle('Release Summary - Genome Statistics');

  const rows = useDataTableRows();

  return rows == null
    ? <Loading />
    : <ReleaseSummaryPage
        header="Genome Sources"
        rows={rows}
        columns={GENOME_SOURCES_COLUMNS}
        columnOrder={GENOME_SOURCES_COLUMN_ORDER}
      />;
}

function useDataTableRows() {
  const taxonUiMetadata = useTaxonUiMetadata();
  const genomeSourcesRows = useGenomeSourcesRows();

  const rows = useMemo(
    () => (
      taxonUiMetadata &&
      genomeSourcesRows &&
      makeDataTableRows(
        taxonUiMetadata,
        genomeSourcesRows
      )
    ),
    [ taxonUiMetadata, genomeSourcesRows ]
  );

  return rows;
}

const GENOME_SOURCES_COLUMNS: DataTableColumns<
  GenomeSourcesRow,
  keyof typeof COMMON_RELEASE_SUMMARY_COLUMNS
> = {
  ...COMMON_RELEASE_SUMMARY_COLUMNS
};

const GENOME_SOURCES_COLUMN_ORDER = [
  'root_taxon',
  'name',
  'core_peripheral',
  'three_letter_abbrev'
] as const;
