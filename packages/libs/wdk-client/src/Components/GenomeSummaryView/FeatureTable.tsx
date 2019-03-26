import React from 'react';

import { StepAnalysisEnrichmentResultTable, ColumnSettings } from 'wdk-client/Core/MoveAfterRefactor/Components/StepAnalysis/StepAnalysisEnrichmentResultTable';
import { GenomeViewRegionModel } from 'wdk-client/Utils/GenomeSummaryViewUtils';

const featureColumnsFactory = (
  displayName: string,
  recordType: string, 
  webAppUrl: string, 
  siteName: string) => 
  [
    {
      key: 'sourceId',
      name: displayName,
      renderCell: ({ value: sourceId }: { value: string }) =>
        <a href={`${webAppUrl}/app/record/${recordType}/${sourceId}`} target="_blank">
          <u>{sourceId}</u>
        </a>,
      sortable: true,
      sortType: 'text'
    },
    {
      key: 'start',
      name: 'Start',
      sortable: true,
      sortType: 'number'
    },
    {
      key: 'end',
      name: 'End',
      sortable: true,
      sortType: 'number'
    },
    {
      key: 'sourceId',
      name: 'Go To',
      renderCell: ({ row: feature }: { row: any }) =>
        <a href={`/cgi-bin/gbrowse/${siteName}/?name=${feature.context};h_feat=${feature.sourceId}@yellow`} target="_blank">
          <u>Gbrowse</u>
        </a>,
      sortable: true,
      sortType: 'text' 
    }
  ] as ColumnSettings[];

interface FeatureTableProps {
  region: GenomeViewRegionModel;
  displayName: string;
  displayNamePlural: string;
  recordType: string;
  webAppUrl: string;
  siteName: string;
}

export const FeatureTable: React.SFC<FeatureTableProps> = ({ 
  region,
  displayName,
  recordType,
  webAppUrl,
  siteName
}) =>
  <StepAnalysisEnrichmentResultTable
    rows={region.features}
    columns={featureColumnsFactory(displayName, recordType, webAppUrl, siteName)}
    emptyResultMessage="No Features present in region"
  />;
