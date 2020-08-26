import React from 'react';
import { useTaxonUiMetadata } from 'ortho-client/hooks/taxons';
import { useGenomeStatisticsRows } from 'ortho-client/hooks/dataSummary';
import { useSetDocumentTitle } from 'wdk-client/Utils/ComponentUtils';
import { OrthoDataTable } from 'ortho-client/components/OrthoDataTable';
import { Loading } from 'wdk-client/Components';

export function GenomeStatisticsController() {
  useSetDocumentTitle('Release Summary - Genome Statistics');

  const props = useDataTableProps();

  return props == null
    ? <Loading />
    : <OrthoDataTable {...props} />;
}

function useDataTableProps() {
  const taxonUiMetadata = useTaxonUiMetadata();
  const genomeStatisticsRows = useGenomeStatisticsRows();

  if (taxonUiMetadata == null || genomeStatisticsRows == null) {
    return undefined;
  }

  return {
    rows: [],
    columns: [],
    columnOrder: []
  };
}
