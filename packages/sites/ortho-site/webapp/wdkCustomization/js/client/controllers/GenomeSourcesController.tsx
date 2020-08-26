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

import './GenomeSourcesController.scss';

export function GenomeSourcesController() {
  useSetDocumentTitle('Release Summary - Genome Statistics');

  const rows = useDataTableRows();

  return rows == null
    ? <Loading />
    : <ReleaseSummaryPage
        containerClassName="GenomeSources"
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
  keyof GenomeSourcesRow
> = {
  ...COMMON_RELEASE_SUMMARY_COLUMNS,
  resource_name: {
    key: 'resource_name',
    name: 'Resource',
    sortable: true
  },
  resource_url: {
    key: 'resource_url',
    name: 'URL',
    sortable: true
  },
  description: {
    key: 'description',
    name: 'Description',
    sortable: true,
    makeOrder: ({ description }) => description || '',
    makeSearchableString: description => description || 'N/A',
    renderCell: ({ value }) =>
      value ? value : <span className="EmptyDescription">N/A</span>
  }
};

const GENOME_SOURCES_COLUMN_ORDER = [
  'root_taxon',
  'name',
  'core_peripheral',
  'three_letter_abbrev',
  'resource_name',
  'resource_url',
  'description'
] as const;
