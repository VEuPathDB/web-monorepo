import React, { useMemo } from 'react';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { ReleaseSummaryPage } from 'ortho-client/components/release-summary/ReleaseSummaryPage';
import { useProteomeSummaryRows } from 'ortho-client/hooks/dataSummary';
import { useTaxonUiMetadata } from 'ortho-client/hooks/taxons';
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
  const proteomeSummaryRows = useProteomeSummaryRows();

  const rows = useMemo(
    () => (
      taxonUiMetadata &&
      proteomeSummaryRows &&
      makeReleaseSummaryRows(
        taxonUiMetadata,
        proteomeSummaryRows
      )
    ),
    [ taxonUiMetadata, proteomeSummaryRows ]
  );

  return rows;
}
