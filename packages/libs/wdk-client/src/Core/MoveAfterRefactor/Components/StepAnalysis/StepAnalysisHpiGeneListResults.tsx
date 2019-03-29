import React, { Fragment } from 'react';
import { StepAnalysisResultPluginProps } from './StepAnalysisResultsPane';
import { integerCell, decimalCellFactory, scientificCellFactory } from './Utils/StepAnalysisResults';
import { StepAnalysisEnrichmentResultTable, ColumnSettings } from './StepAnalysisEnrichmentResultTable';

import './StepAnalysisEnrichmentResult.scss';

const columnKeys = [
  'species',
  'experimentName',
  'description',
  'type',
  'c11',
  'c22',
  'c33',
  'c44',
  'c55',
  'significance'
];

const hpiGeneListResultColumns = (headerRow: any, headerDescription: any): ColumnSettings[] => columnKeys.map(key => (
  key === 'species'
    ? {
      key,
      name: headerRow[key],
      helpText: headerDescription[key],
      type: 'html',
      sortable: false
    }
    : {
      key,
      name: headerRow[key],
      helpText: headerDescription[key],
      renderCell: key === 'experimentName'
        ? ({ row }: any) => (
            <a href={`${row.uri}`} target="_blank">{row.experimentName}</a>
          )
        : ({ row }: any) => row[key],
      sortable: false
    }
));

export const StepAnalysisHpiGeneListResults: React.SFC<StepAnalysisResultPluginProps> = ({
  analysisResult: {
    resultData,
    headerRow,
    headerDescription
  }
}) => (
  <>
    <h3>Analysis Results:   </h3>
    <StepAnalysisEnrichmentResultTable
      emptyResultMessage={'No enrichment was found for the threshold you specified.'}
      rows={resultData}
      columns={hpiGeneListResultColumns(headerRow, headerDescription)}
      initialSortColumnKey={'pValue'}
    />
  </>
);
