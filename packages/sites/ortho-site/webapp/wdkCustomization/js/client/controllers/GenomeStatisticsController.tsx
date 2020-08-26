import React, { useMemo } from 'react';

import { Loading } from 'wdk-client/Components';
import { useSetDocumentTitle } from 'wdk-client/Utils/ComponentUtils';

import { OrthoDataTable } from 'ortho-client/components/OrthoDataTable';
import { useTaxonUiMetadata } from 'ortho-client/hooks/taxons';
import { useGenomeStatisticsRows } from 'ortho-client/hooks/dataSummary';
import { GenomeStatisticsRows } from 'ortho-client/utils/dataSummary';
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

interface GenomeStatisticsTableRow {
  root_taxon: string;
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

function makeDataTableRows(
  { species }: TaxonUiMetadata,
  genomeStatisticsRows: GenomeStatisticsRows
): GenomeStatisticsTableRow[] {
  return genomeStatisticsRows.map(
    ({ three_letter_abbrev }) => ({
      root_taxon: species[three_letter_abbrev].rootTaxon
    })
  );
}

const GENOME_STATISTICS_COLUMNS: DataTableColumns<GenomeStatisticsTableRow, 'root_taxon'> = {
  root_taxon: {
    key: 'root_taxon',
    name: 'Category',
    sortable: true
  }
};

const GENOME_STATISTICS_COLUMN_ORDER = [
  'root_taxon'
] as const;
