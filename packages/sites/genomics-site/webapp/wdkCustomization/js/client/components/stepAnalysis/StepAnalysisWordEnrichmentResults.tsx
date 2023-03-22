import React, { Fragment } from 'react';
import { StepAnalysisResultPluginProps } from '@veupathdb/wdk-client/lib/Components/StepAnalysis/StepAnalysisResultsPane';
import { integerCell, decimalCellFactory, scientificCellFactory } from '@veupathdb/wdk-client/lib/Components/StepAnalysis/Utils/StepAnalysisResults';
import { CommonResultTable, ColumnSettings } from '@veupathdb/wdk-client/lib/Components/Shared/CommonResultTable';

import './StepAnalysisEnrichmentResult.scss';
import { StepAnalysisButtonArray } from '@veupathdb/wdk-client/lib/Components/StepAnalysis/StepAnalysisButtonArray';

const wordEnrichmentResultColumns = [
  { key: 'word', name: 'Word', helpText: 'Word', sortable: true },
  {
    key: 'descrip',
    name: 'Description',
    helpText: 'Description',
    sortable: true
  },
  {
    key: 'bgdGenes',
    name: 'Genes in the bkgd with this word',
    helpText: 'Number of genes with this word in the background',
    renderCell: integerCell('bgdGenes'),
    sortable: true,
    sortType: 'number'
  },
  {
    key: 'resultGenes',
    name: 'Genes in your result with this word',
    helpText: 'Number of genes with this word in your result',
    renderCell: integerCell('resultGenes'),
    sortable: true,
    sortType: 'number'
  },
  {
    key: 'percentInResult',
    name: 'Percent of bkgd Genes in your result',
    helpText:
      'Of the genes in the background with this word, the percent that are present in your result',
    renderCell: decimalCellFactory(1)('percentInResult'),
    sortable: true,
    sortType: 'number'
  },
  {
    key: 'foldEnrich',
    name: 'Fold enrichment',
    helpText:
      'The percent of genes with this word in your result divided by the percent of genes with this word in the background',
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

const wordEnrichmentButtonsConfigFactory = (
  stepId: number,
  analysisId: number,
  { downloadPath }: any,
  webAppUrl: string
) => [
    {
      key: 'download',
      href: `${webAppUrl}/service/users/current/steps/${stepId}/analyses/${analysisId}/resources?path=${downloadPath}`,
      iconClassName: 'fa fa-download blue-text',
      contents: 'Download'
    }
  ];

export const StepAnalysisWordEnrichmentResults: React.SFC<StepAnalysisResultPluginProps> = ({
  analysisResult,
  analysisConfig,
  webAppUrl
}) => (
  <Fragment>
    <StepAnalysisButtonArray configs={
      wordEnrichmentButtonsConfigFactory(
        analysisConfig.stepId,
        analysisConfig.analysisId,
        analysisResult,
        webAppUrl
      )
    } />
    <h3>Analysis Results:   </h3>
    <CommonResultTable
      emptyResultMessage={'No enrichment was found with significance at the P-value threshold you specified.'}
      rows={analysisResult.resultData}
      columns={wordEnrichmentResultColumns}
      initialSortColumnKey={'pValue'}
      fixedTableHeader
    />
  </Fragment>
);
