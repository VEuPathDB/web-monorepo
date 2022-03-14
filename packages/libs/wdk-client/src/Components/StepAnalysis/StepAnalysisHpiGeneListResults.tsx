import React, { Fragment } from 'react';
import { StepAnalysisResultPluginProps } from './StepAnalysisResultsPane'
import { StepAnalysisEnrichmentResultTable, ColumnSettings } from './StepAnalysisEnrichmentResultTable';
import Templates from '../Mesa/Templates';

import './StepAnalysisEnrichmentResult.scss';
import { Tooltip } from '../../Components';

const baseColumnSettings: Pick<ColumnSettings, 'key' | 'renderCell' | 'sortable' | 'sortType' | 'type'>[] = [
  {
    key: 'species',
    type: 'html',
    sortable: true,
    sortType: 'htmlText'
  },
  {
    key: 'experimentName',
    renderCell: (cellProps: any) => (
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
    ),
    sortable: true
  },
  {
    key: 'type',
    sortable: true
  },
  {
    key: 'c11',
    sortable: true,
    sortType: 'number'
  },
  {
    key: 'c22',
    sortable: true,
    sortType: 'number'
  },
  {
    key: 'c33',
    sortable: true,
    sortType: 'number'
  },
  {
    key: 'c44',
    sortable: true,
    sortType: 'number'
  },
  {
    key: 'c55',
    sortable: true,
    sortType: 'number'
  },
  {
    key: 'significance',
    sortable: true,
    sortType: 'number'
  }
];

const hpiGeneListResultColumns = (headerRow: any, headerDescription: any): ColumnSettings[] => baseColumnSettings.map(column => ({
  ...column,
  name: headerRow[column.key],
  helpText: headerDescription[column.key]
}));

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
