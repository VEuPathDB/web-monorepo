import React, { Fragment } from 'react';

import { GenomeSummaryViewReportModel } from 'wdk-client/Utils/GenomeSummaryViewUtils';
import { EmptyChromosomesFilter } from 'wdk-client/Components/GenomeSummaryView/EmptyChromosomeFilter';
import { RegionDialog } from 'wdk-client/Components/GenomeSummaryView/RegionDialog';
import { ResultsLegend } from 'wdk-client/Components/GenomeSummaryView/ResultsLegend';
import { ResultsTable } from 'wdk-client/Components/GenomeSummaryView/ResultsTable';

import 'wdk-client/Components/GenomeSummaryView/GenomeSummaryView.scss';

export interface GenomeSummaryViewProps {
  genomeSummaryData: GenomeSummaryViewReportModel;
  displayName: string;
  displayNamePlural: string;
  recordType: string;
  regionDialogVisibilities: Record<string, boolean>;
  emptyChromosomeFilterApplied: boolean;
  showRegionDialog: (regionId: string) => void;
  hideRegionDialog: (regionId: string) => void;
  applyEmptyChromosomeFilter: () => void;
  unapplyEmptyChromosomeFilter: () => void;
};

export const GenomeSummaryView: React.SFC<GenomeSummaryViewProps> = ({ 
  genomeSummaryData, 
  displayName, 
  displayNamePlural, 
  recordType,
  regionDialogVisibilities,
  emptyChromosomeFilterApplied,
  showRegionDialog,
  hideRegionDialog,
  applyEmptyChromosomeFilter,
  unapplyEmptyChromosomeFilter
}) => (
  <div className="genome-view">
    <ResultsLegend displayNamePlural={displayNamePlural} />
    <EmptyChromosomesFilter 
      applied={emptyChromosomeFilterApplied}
      onChange={() => emptyChromosomeFilterApplied
        ? unapplyEmptyChromosomeFilter()
        : applyEmptyChromosomeFilter()
      }
    />
    {
      genomeSummaryData.type === 'untruncated'
        ? (
          <Fragment>
            {genomeSummaryData.sequences.flatMap((sequence, i) =>
              sequence.regions.map((region, j) =>
                <RegionDialog 
                  key={region.sourceId}
                  sequence={sequence}
                  region={region}
                  open={regionDialogVisibilities[region.sourceId]}
                  onClose={() => hideRegionDialog(region.sourceId)}
                  displayName={displayName}
                  displayNamePlural={displayNamePlural}
                  recordType={recordType}
                />
              )
            )}
            <ResultsTable
              emptyChromosomeFilterApplied
              displayName={displayName}
              displayNamePlural={displayNamePlural}
              report={genomeSummaryData}
              recordType={recordType}
              showRegionDialog={showRegionDialog}
            />
          </Fragment>
        )
        : (
          <p>
            The number of {displayNamePlural} in the result exceeds the display limit (10000 IDs), Genomic Summary View is not available for the result.
          </p>
        )
    }
  </div>
);
