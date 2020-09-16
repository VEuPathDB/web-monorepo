import React, { useMemo } from 'react';

import { Loading } from 'wdk-client/Components';
import { useSetDocumentTitle } from 'wdk-client/Utils/ComponentUtils';

import { ReleaseSummaryPage } from 'ortho-client/components/release-summary/ReleaseSummaryPage';
import { useTaxonUiMetadata } from 'ortho-client/hooks/taxons';
import {
  useGenomeSourcesRows,
  useGenomeStatisticsRows
} from 'ortho-client/hooks/dataSummary';
import {
  RELEASE_SUMMARY_COLUMNS,
  RELEASE_SUMMARY_COLUMN_ORDER,
  makeReleaseSummaryRows
} from 'ortho-client/utils/dataSummary';

import './ProteomeSummaryController.scss';

export function ProteomeSummaryController() {
  useSetDocumentTitle('Release Summary');

  const rows = useDataTableRows();

  return rows == null
    ? <Loading />
    : <ReleaseSummaryPage
        containerClassName="ProteomeSummary"
        header="Proteome Sources and Statistics"
        rows={rows}
        columns={RELEASE_SUMMARY_COLUMNS}
        columnOrder={RELEASE_SUMMARY_COLUMN_ORDER}
      />;
}

function useDataTableRows() {
  const taxonUiMetadata = useTaxonUiMetadata();
  const genomeStatisticsRows = useGenomeStatisticsRows();
  const genomeSourcesRows = useGenomeSourcesRows();

  const rows = useMemo(
    () => (
      taxonUiMetadata &&
      genomeStatisticsRows &&
      genomeSourcesRows &&
      makeReleaseSummaryRows(
        taxonUiMetadata,
        genomeStatisticsRows,
        genomeSourcesRows
      )
    ),
    [ taxonUiMetadata, genomeStatisticsRows, genomeSourcesRows ]
  );

  return rows;
}
