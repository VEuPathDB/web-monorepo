import React, { useMemo } from 'react';

import { Loading } from 'wdk-client/Components';
import { useSetDocumentTitle } from 'wdk-client/Utils/ComponentUtils';

import { OrthoDataTable } from 'ortho-client/components/OrthoDataTable';
import { useTaxonUiMetadata } from 'ortho-client/hooks/taxons';
import { useGenomeStatisticsRows } from 'ortho-client/hooks/dataSummary';
import { GenomeStatisticsRows } from 'ortho-client/utils/dataSummary';
import { DataTableColumns, DataTableColumnKey } from 'ortho-client/utils/dataTables';
import { TaxonUiMetadata } from 'ortho-client/utils/taxons';

export function GenomeStatisticsController() {
  useSetDocumentTitle('Release Summary - Genome Statistics');

  const props = useDataTableProps();

  return props == null
    ? <Loading />
    : <OrthoDataTable {...props} />;
}

interface GenomeStatisticsTableRow {
  root_taxon: string;
}

function useDataTableProps() {
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
    [ genomeStatisticsRows ]
  );

  const columns = useMemo(
    () => makeDataTableColumns(),
    []
  );

  const columnOrder = useMemo(
    () => makeDataTableColumnOrder(),
    []
  );

  return rows == undefined
    ? undefined
    : {
        rows,
        columns,
        columnOrder
      };
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

function makeDataTableColumns(): DataTableColumns<GenomeStatisticsTableRow, 'root_taxon'> {
  return {
    root_taxon: {
      key: 'root_taxon',
      name: 'Category',
      sortable: true
    }
  };
}

function makeDataTableColumnOrder(): DataTableColumnKey<GenomeStatisticsTableRow>[] {
  return [
    'root_taxon'
  ];
}
