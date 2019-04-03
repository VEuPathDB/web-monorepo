import React, { Fragment } from 'react';
import { StepAnalysisResultPluginProps } from './StepAnalysisResultsPane'
import { StepAnalysisEnrichmentResultTable, ColumnSettings } from './StepAnalysisEnrichmentResultTable';
import Templates from 'wdk-client/Components/Mesa/Templates';

import './StepAnalysisEnrichmentResult.scss';
import { Tooltip } from 'wdk-client/Components';

const columnKeys = [
  'species',
  'experimentName',
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
        ? (cellProps: any) => (
            <Tooltip
              content={Templates.htmlCell({
                ...cellProps,
                key: 'description',
                value: cellProps.row.description
              })}
            >
              <a 
                title={cellProps.row.description} 
                href={`${cellProps.row.uri}`} 
                target="_blank">{cellProps.row.experimentName}
              </a>
            </Tooltip>
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
      fixedTableHeader
    />
  </>
);
