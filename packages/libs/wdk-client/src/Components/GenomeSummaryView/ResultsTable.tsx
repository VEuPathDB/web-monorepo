import React from 'react';

import { Tooltip } from 'wdk-client/Components';
import { ColumnSettings, StepAnalysisEnrichmentResultTable } from 'wdk-client/Core/MoveAfterRefactor/Components/StepAnalysis/StepAnalysisEnrichmentResultTable';
import { GenomeSummaryViewReportModel, GenomeViewRegionModel, GenomeViewFeatureModel, GenomeViewSequenceModel } from 'wdk-client/Utils/GenomeSummaryViewUtils';
import { FeatureTooltip } from './FeatureTooltip';

const resultColumnsFactory = (
    webAppUrl: string, 
    displayName: string, 
    displayNamePlural: string, 
    siteName: string, 
    recordType: string,
    showRegionDialog: (regionId: string) => void
  ) => [
  {
    key: 'sourceId',
    name: 'Sequence',
    renderCell: ({ value: sourceId }: { value: string }) =>
      <a href={`${webAppUrl}/app/record/genomic-sequence/${sourceId}`} target="_blank">{sourceId}</a>,
    sortable: true,
    sortType: 'text'
  },
  {
    key: 'organism',
    name: 'Organism',
    renderCell: ({ value: organism }: { value: string }) =>
      <em>{organism}</em>,
    sortable: true,
    sortType: 'text'
  },
  {
    key: 'chromosome',
    name: 'Chromosome',
    sortable: true,
    sortType: 'text'
  },
  {
    key: 'featureCount',
    name: `#${displayNamePlural}`,
    sortType: 'number',
    sortable: true,
  },
  {
    key: 'length',
    name: 'Length',
    helpText: 'Length of the genomic sequence in #bases',
    sortType: 'number',
    sortable: true,
  },
  {
    key: 'sourceId',
    name: `${displayName} Locations`,
    renderCell: locationCellRenderFactory(displayNamePlural, webAppUrl, siteName, recordType, showRegionDialog),
    sortable: false
  }
] as ColumnSettings[];

const locationCellRenderFactory = (
  displayNamePlural: string, 
  webAppUrl: string, 
  siteName: string, 
  recordType: string,
  showRegionDialog: (regionId: string) => void
) => ({ row: sequence }: { row: GenomeViewSequenceModel }) =>
  <div className="canvas">
    <div 
      className="ruler" 
      title={`${sequence.sourceId}, length: ${sequence.length}`}
      style={{ width: `${sequence.percentLength}%` }}
    >
    </div>
    {
      sequence.regions.map(region =>
        <Region 
          key={region.sourceId} 
          displayNamePlural={displayNamePlural}
          region={region}
          sequence={sequence}
          recordType={recordType}
          webAppUrl={webAppUrl}
          siteName={siteName}
          showDialog={() => showRegionDialog(region.sourceId)}
        />
      )
    }
  </div>;

interface RegionProps {
  displayNamePlural: string;
  region: GenomeViewRegionModel;
  sequence: GenomeViewSequenceModel;
  recordType: string;
  webAppUrl: string;
  siteName: string;
  showDialog: () => void;
}

const Region: React.SFC<RegionProps> = ({ 
  displayNamePlural,
  region,
  recordType,
  webAppUrl,
  siteName,
  sequence,
  showDialog
}) => region.featureCount > 1
  ? <MultiFeatureRegion displayNamePlural={displayNamePlural} region={region} showDialog={showDialog} />
  : <SingleFeatureRegion 
      region={region} 
      feature={region.features[0]} 
      recordType={recordType} 
      webAppUrl={webAppUrl} 
      siteName={siteName} 
      sequence={sequence}
    />;

type MultiFeatureRegionProps = {
  displayNamePlural: string;
  region: GenomeViewRegionModel;
  showDialog: () => void
}

const MultiFeatureRegion: React.SFC<MultiFeatureRegionProps> = ({
  displayNamePlural,
  region,
  showDialog
}) => 
  <div
    className={`region ${region.strand}`}
    onClick={showDialog}
    title={`${region.stringRep}, with ${region.featureCount} ${displayNamePlural}. Click to view detail.`}
    style={{
      left: `${region.percentStart}%`,
      width: `${region.percentLength}%`
    }}
  >
  </div>;

interface SingleFeatureRegionProps {
  region: GenomeViewRegionModel;
  feature: GenomeViewFeatureModel;
  sequence: GenomeViewSequenceModel;
  recordType: string;
  webAppUrl: string;
  siteName: string;
}

const SingleFeatureRegion: React.SFC<SingleFeatureRegionProps> = ({ 
  region, 
  feature,
  sequence,
  recordType,
  webAppUrl,
  siteName
}) =>
  <Tooltip
    content={
      <FeatureTooltip
        feature={feature}
        sequence={sequence}
        recordType={recordType}
        webAppUrl={webAppUrl}
        siteName={siteName}
      />
    }
  >
  <div
    className={`feature ${feature.strand}`}
    style={{ 
      left: `${region.percentStart}%`,
      width: `${region.percentLength}%` 
    }}
  >
  </div>
  </Tooltip>

interface ResultsTableProps {
  webAppUrl: string;
  report: GenomeSummaryViewReportModel;
  displayName: string;
  displayNamePlural: string;
  recordType: string;
  siteName: string;
  showRegionDialog: (regionId: string) => void;
}

export const ResultsTable: React.SFC<ResultsTableProps> = ({ 
  webAppUrl, 
  report, 
  displayName, 
  displayNamePlural,
  siteName,
  recordType,
  showRegionDialog
}) =>
  <StepAnalysisEnrichmentResultTable
    rows={report.type === 'truncated' ? [] : report.sequences}
    columns={resultColumnsFactory(webAppUrl, displayName, displayNamePlural, siteName, recordType, showRegionDialog)}
    emptyResultMessage="No Genomes present in result"
  />;
