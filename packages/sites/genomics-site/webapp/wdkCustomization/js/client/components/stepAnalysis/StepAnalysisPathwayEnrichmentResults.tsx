import { scientificCellFactory, decimalCellFactory, integerCell } from '@veupathdb/wdk-client/lib/Components/StepAnalysis/Utils/StepAnalysisResults';
import { StepAnalysisResultPluginProps } from '@veupathdb/wdk-client/lib/Components/StepAnalysis/StepAnalysisResultsPane';
import { ColumnSettings, CommonResultTable } from '@veupathdb/wdk-client/lib/Components/Shared/CommonResultTable';
import React, { Fragment, useState } from 'react';
import { StepAnalysisButtonArray } from '@veupathdb/wdk-client/lib/Components/StepAnalysis/StepAnalysisButtonArray';
import { WordCloudModal } from './StepAnalysisWordCloudModal';

import './StepAnalysisEnrichmentResult.scss';

const pathwayEnrichmentResultColumns = [
  {
    key: 'pathwayId',
    name: 'Pathway ID',
    helpText: 'Pathway ID',
    sortable: true
  },
  {
    key: 'pathwayName',
    name: 'Pathway Name',
    helpText: 'Pathway Name',
    type: 'html',
    sortable: true,
    sortType: 'htmlText'
  },
  {
    key: 'pathwaySource',
    name: 'Pathway Source',
    helpText: 'Pathway Source',
    sortable: true
  },
  {
    key: 'bgdGenes',
    name: 'Genes in the bkgd with this pathway',
    helpText: 'Number of genes in this pathway in the background',
    renderCell: integerCell('bgdGenes'),
    sortable: true,
    sortType: 'number'
  },
  {
    key: 'resultGenes',
    name: 'Genes in your result with this pathway',
    helpText: 'Number of genes in this pathway in your result',
    type: 'html',
    sortable: true,
    sortType: 'htmlNumber'
  },
  {
    key: 'percentInResult',
    name: 'Percent of bkgd Genes in your result',
    helpText:
      'Percentage of genes in the background in this pathway that are present in your result',
    renderCell: decimalCellFactory(1)('percentInResult'),
    sortable: true,
    sortType: 'number'
  },
  {
    key: 'foldEnrich',
    name: 'Fold enrichment',
    helpText:
      'The percent of genes in this pathway in your result divided by the percent of genes in this pathway in the background',
    renderCell: decimalCellFactory(2)('foldEnrich'),
    sortable: true,
    sortType: 'number'
  },
  {
    key: 'oddsRatio',
    name: 'Odds ratio',
    helpText: "Odds ratio statistic from the Fisher's exact test",
    renderCell: decimalCellFactory(2)('oddsRatio'),
    sortable: true,
    sortType: 'number'
  },
  {
    key: 'pValue',
    name: 'P-value',
    helpText: "P-value from Fisher's exact test",
    renderCell: scientificCellFactory(2)('pValue'),
    sortable: true,
    sortType: 'number'
  },
  {
    key: 'benjamini',
    name: 'Benjamini',
    helpText: 'Benjamini-Hochberg false discovery rate (FDR)',
    renderCell: scientificCellFactory(2)('benjamini'),
    sortable: true,
    sortType: 'number'
  },
  {
    key: 'bonferroni',
    name: 'Bonferroni',
    helpText: 'Bonferroni adjusted p-value',
    renderCell: scientificCellFactory(2)('bonferroni'),
    sortable: true,
    sortType: 'number'
  }
] as ColumnSettings[];

const pathwayIdRenderFactory = (pathwayBaseUrl: string) => ({ row }: Record<string, any>) =>
  <a href={`${pathwayBaseUrl}${row.pathwaySource}/${row.pathwayId}`} target="_blank">{row.pathwayId}</a>

const pathwayButtonsConfigFactory = (
  stepId: number,
  analysisId: number,
  { imageDownloadPath, hiddenDownloadPath }: any,
  webAppUrl: string,
  setWordCloudOpen: (wordCloudOpen: boolean) => void
) => [
    {
      key: 'wordCloud',
      onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        setWordCloudOpen(true);
      },
      href: `${webAppUrl}/service/users/current/steps/${stepId}/analyses/${analysisId}/resources?path=${imageDownloadPath}`,
      iconClassName: 'fa fa-bar-chart red-text',
      contents: <Fragment>Show <b>Word Cloud</b></Fragment>
    },
    {
      key: 'download',
      href: `${webAppUrl}/service/users/current/steps/${stepId}/analyses/${analysisId}/resources?path=${hiddenDownloadPath}`,
      iconClassName: 'fa fa-download blue-text',
      contents: 'Download'
    }
  ];

export const StepAnalysisPathwayEnrichmentResults: React.SFC<StepAnalysisResultPluginProps> = ({
  analysisResult,
  analysisConfig,
  webAppUrl
}) => {
  const [wordCloudOpen, setWordCloudOpen] = useState(false);

  return (
    <Fragment>
      <StepAnalysisButtonArray
        configs={pathwayButtonsConfigFactory(
          analysisConfig.stepId,
          analysisConfig.analysisId,
          analysisResult,
          webAppUrl,
          setWordCloudOpen
        )}
      />
      <h3>Analysis Results:   </h3>
      <CommonResultTable
        emptyResultMessage={'No enrichment was found with significance at the P-value threshold you specified.'}
        rows={analysisResult.resultData}
        columns={pathwayEnrichmentResultColumns.map(column =>
          column.key === 'pathwayId'
            ? { ...column, renderCell: pathwayIdRenderFactory(analysisResult.pathwayBaseUrl) }
            : column
        )}
        initialSortColumnKey={'oddsRatio'}
        fixedTableHeader
      />
      <WordCloudModal
        imgUrl={
          `${webAppUrl}/service/users/current/steps/${analysisConfig.stepId}/analyses/${analysisConfig.analysisId}/resources?path=${analysisResult.imageDownloadPath}&_=${Date.now()}`
        }
        open={wordCloudOpen}
        onClose={() => {
          setWordCloudOpen(false);
        }}
        toolName={'Metabolic Pathway Enrichment Analysis'}
      />
    </Fragment>
  );
};
