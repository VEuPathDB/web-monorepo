import React from 'react';

import { EagerlyLoadedTooltip } from 'wdk-client/Components/Overlays/Tooltip';
import { ColumnSettings, StepAnalysisEnrichmentResultTable } from 'wdk-client/Core/MoveAfterRefactor/Components/StepAnalysis/StepAnalysisEnrichmentResultTable';
import { GenomeSummaryViewReportModel, GenomeViewRegionModel, GenomeViewFeatureModel, GenomeViewSequenceModel } from 'wdk-client/Utils/GenomeSummaryViewUtils';
import { FeatureTooltip } from 'wdk-client/Components/GenomeSummaryView/FeatureTooltip';
import { memoize } from 'lodash/fp';
import { Link } from 'react-router-dom';

const resultColumnsFactory = memoize((
    displayName: string, 
    displayNamePlural: string, 
    recordType: string,
    showRegionDialog: (regionId: string) => void
  ) => [
  {
    key: 'sourceId',
    name: 'Sequence',
    width: '10%',
    renderCell: ({ value: sourceId }: { value: string }) =>
      <Link to={`/record/genomic-sequence/${sourceId}`} target="_blank">{sourceId}</Link>,
    sortable: true,
    sortType: 'text'
  },
  {
    key: 'organism',
    name: 'Organism',
    width: '10%',
    renderCell: ({ value: organism }: { value: string }) =>
      <em>{organism}</em>,
    sortable: true,
    sortType: 'text'
  },
  {
    key: 'chromosome',
    name: 'Chromosome',
    width: '5%',
    sortable: true,
    sortType: 'text'
  },
  {
    key: 'featureCount',
    name: `#${displayNamePlural}`,
    width: '5%',
    sortType: 'number',
    sortable: true,
  },
  {
    key: 'length',
    name: 'Length',
    width: '10%',
    helpText: 'Length of the genomic sequence in #bases',
    sortType: 'number',
    sortable: true,
  },
  {
    key: 'sourceId',
    name: `${displayName} Locations`,
    width: '60%',
    renderCell: locationCellRenderFactory(displayNamePlural, recordType, showRegionDialog),
    sortable: false
  }
] as ColumnSettings[]);

const locationCellRenderFactory = (
  displayNamePlural: string, 
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
  showDialog: () => void;
}

const Region: React.SFC<RegionProps> = ({ 
  displayNamePlural,
  region,
  recordType,
  sequence,
  showDialog
}) => region.featureCount > 1
  ? <MultiFeatureRegion displayNamePlural={displayNamePlural} region={region} showDialog={showDialog} />
  : <SingleFeatureRegion 
      region={region} 
      feature={region.features[0]} 
      recordType={recordType} 
      sequence={sequence}
    />;

interface MultiFeatureRegionProps {
  displayNamePlural: string;
  region: GenomeViewRegionModel;
  showDialog: () => void;
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
}

const SingleFeatureRegion: React.SFC<SingleFeatureRegionProps> = ({ 
  region, 
  feature,
  sequence,
  recordType,
}) =>
  <EagerlyLoadedTooltip
    content={
      <FeatureTooltip
        feature={feature}
        sequence={sequence}
        recordType={recordType}
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
  </EagerlyLoadedTooltip>;

interface ResultsTableProps {
  emptyChromosomeFilterApplied: boolean;
  report: GenomeSummaryViewReportModel;
  displayName: string;
  displayNamePlural: string;
  recordType: string;
  showRegionDialog: (regionId: string) => void;
}

const rowsFactory = memoize(
  (report: GenomeSummaryViewReportModel, emptyChromosomeFilterApplied: boolean) =>
    report.type === 'truncated'
      ? []
      : (
        emptyChromosomeFilterApplied
          ? report.sequences.filter(({ featureCount }) => featureCount)
          : report.sequences
      )
);

export const ResultsTable: React.SFC<ResultsTableProps> = ({ 
  emptyChromosomeFilterApplied,
  report, 
  displayName, 
  displayNamePlural,
  recordType,
  showRegionDialog
}) =>
  <StepAnalysisEnrichmentResultTable
    rows={rowsFactory(report, emptyChromosomeFilterApplied)}
    columns={resultColumnsFactory(displayName, displayNamePlural, recordType, showRegionDialog)}
    initialSortColumnKey="featureCount"
    initialSortDirection="desc"
    emptyResultMessage="No Genomes present in result"
    fixedTableHeader
    pagination
  />;
