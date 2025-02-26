import React, { Fragment } from 'react';
import { StepAnalysisResultPluginProps } from '@veupathdb/wdk-client/lib/Components/StepAnalysis/StepAnalysisResultsPane';
import {
  CommonResultTable,
  ColumnSettings,
} from '@veupathdb/wdk-client/lib/Components/Shared/CommonResultTable';
import Templates from '@veupathdb/coreui/lib/components/Mesa/Templates';

import './StepAnalysisEnrichmentResult.scss';
import { Tooltip } from '@veupathdb/coreui';

const baseColumnSettings: Pick<
  ColumnSettings<any>,
  'key' | 'renderCell' | 'sortable' | 'sortType' | 'type'
>[] = [
  {
    key: 'species',
    type: 'html',
    sortable: true,
    sortType: 'htmlText',
  },
  {
    key: 'experimentName',
    renderCell: (cellProps: any) => (
      <Tooltip
        title={Templates.htmlCell({
          ...cellProps,
          key: 'description',
          value: cellProps.row.description,
        })}
      >
        <a
          title={cellProps.row.description}
          href={`${cellProps.row.uri}`}
          target="_blank"
        >
          {cellProps.row.experimentName}
        </a>
      </Tooltip>
    ),
    sortable: true,
  },
  {
    key: 'type',
    sortable: true,
  },
  {
    key: 'c11',
    sortable: true,
    sortType: 'number',
  },
  {
    key: 'c22',
    sortable: true,
    sortType: 'number',
  },
  {
    key: 'c33',
    sortable: true,
    sortType: 'number',
  },
  {
    key: 'c44',
    sortable: true,
    sortType: 'number',
  },
  {
    key: 'c55',
    sortable: true,
    sortType: 'number',
  },
  {
    key: 'significance',
    sortable: true,
    sortType: 'number',
  },
];

const hpiGeneListResultColumns = (
  headerRow: any,
  headerDescription: any
): ColumnSettings<any>[] =>
  baseColumnSettings.map((column) => ({
    ...column,
    name: headerRow[column.key],
    helpText: headerDescription[column.key],
  }));

export const StepAnalysisHpiGeneListResults: React.FunctionComponent<StepAnalysisResultPluginProps> =
  ({ analysisResult: { resultData, headerRow, headerDescription } }) => (
    <>
      <h3>Analysis Results: </h3>
      <CommonResultTable
        emptyResultMessage={
          'No enrichment was found for the threshold you specified.'
        }
        rows={resultData}
        columns={hpiGeneListResultColumns(headerRow, headerDescription)}
        fixedTableHeader
      />
    </>
  );
