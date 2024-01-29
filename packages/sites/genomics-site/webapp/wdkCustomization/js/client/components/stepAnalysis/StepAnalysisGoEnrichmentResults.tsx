import {
  scientificCellFactory,
  decimalCellFactory,
  integerCell,
} from '@veupathdb/wdk-client/lib/Components/StepAnalysis/Utils/StepAnalysisResults';
import { StepAnalysisResultPluginProps } from '@veupathdb/wdk-client/lib/Components/StepAnalysis/StepAnalysisResultsPane';
import {
  ColumnSettings,
  CommonResultTable,
} from '@veupathdb/wdk-client/lib/Components/Shared/CommonResultTable';
import React, { Fragment, useState } from 'react';
import { StepAnalysisButtonArray } from '@veupathdb/wdk-client/lib/Components/StepAnalysis/StepAnalysisButtonArray';
import { WordCloudModal } from './StepAnalysisWordCloudModal';

import './StepAnalysisEnrichmentResult.scss';

const goEnrichmentResultColumns = [
  {
    key: 'goId',
    name: 'GO ID',
    helpText: 'Gene Ontology ID',
    sortable: true,
  },
  {
    key: 'goTerm',
    name: 'GO Term',
    helpText: 'Gene Ontology Term',
    sortable: true,
  },
  {
    key: 'bgdGenes',
    name: 'Genes in the bkgd with this term',
    helpText: 'Number of genes with this term in the background',
    renderCell: integerCell('bgdGenes'),
    sortable: true,
    sortType: 'number',
  },
  {
    key: 'resultGenes',
    name: 'Genes in your result with this term',
    helpText: 'Number of genes with this term in your result',
    type: 'html',
    sortable: true,
    sortType: 'htmlNumber',
  },
  {
    key: 'percentInResult',
    name: 'Percent of bkgd genes in your result',
    helpText:
      'Of the genes in the background with this term, the percent that are present in your result',
    renderCell: decimalCellFactory(1)('percentInResult'),
    sortable: true,
    sortType: 'number',
  },
  {
    key: 'foldEnrich',
    name: 'Fold enrichment',
    helpText:
      'The percent of genes with this term in your result divided by the percent of genes with this term in the background',
    renderCell: decimalCellFactory(2)('foldEnrich'),
    sortable: true,
    sortType: 'number',
  },
  {
    key: 'oddsRatio',
    name: 'Odds ratio',
    helpText: "Odds ratio statistic from the Fisher's exact test",
    renderCell: decimalCellFactory(2)('oddsRatio'),
    sortable: true,
    sortType: 'number',
  },
  {
    key: 'pValue',
    name: 'P-value',
    helpText: "P-value from Fisher's exact test",
    renderCell: scientificCellFactory(2)('pValue'),
    sortable: true,
    sortType: 'number',
  },
  {
    key: 'benjamini',
    name: 'Benjamini',
    helpText: 'Benjamini-Hochberg false discovery rate (FDR)',
    renderCell: scientificCellFactory(2)('benjamini'),
    sortable: true,
    sortType: 'number',
  },
  {
    key: 'bonferroni',
    name: 'Bonferroni',
    helpText: 'Bonferroni adjusted p-value',
    renderCell: scientificCellFactory(2)('bonferroni'),
    sortable: true,
    sortType: 'number',
  },
] as ColumnSettings<any>[];

const goIdRenderFactory =
  (goTermBaseUrl: string) =>
  ({ row }: Record<string, any>) =>
    (
      <a
        title="Check this term in the GO hierarchy (Amigo website)"
        href={`${goTermBaseUrl}${row.goId}#display-lineage-tab`}
        target="_blank"
      >
        {row.goId}
      </a>
    );

const goButtonsConfigFactory = (
  stepId: number,
  analysisId: number,
  { imageDownloadPath, hiddenDownloadPath, revidoInputList }: any,
  webAppUrl: string,
  setWordCloudOpen: (wordCloudOpen: boolean) => void
) => [
  {
    key: 'revigo',
    customButton: (
      <form target="_blank" action="http://revigo.irb.hr/" method="post">
        <textarea
          name="inputGoList"
          rows={10}
          cols={80}
          hidden
          readOnly
          value={revidoInputList}
        />
        <input name="isPValue" hidden readOnly value="yes" />
        <input name="outputListSize" hidden readOnly value="medium" />
        <button
          type="submit"
          name="startRevigo"
          className="btn"
          style={{ fontSize: '12px' }}
        >
          <i
            className="fa fa-bar-chart red-text"
            style={{ marginLeft: 0, paddingLeft: 0 }}
          >
            {' '}
          </i>
          Open in <b>Revigo</b>
        </button>
      </form>
    ),
  },
  {
    key: 'wordCloud',
    onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      setWordCloudOpen(true);
    },
    href: `${webAppUrl}/service/users/current/steps/${stepId}/analyses/${analysisId}/resources?path=${imageDownloadPath}`,
    iconClassName: 'fa fa-bar-chart red-text',
    contents: (
      <Fragment>
        Show <b>Word Cloud</b>
      </Fragment>
    ),
  },
  {
    key: 'download',
    href: `${webAppUrl}/service/users/current/steps/${stepId}/analyses/${analysisId}/resources?path=${hiddenDownloadPath}`,
    iconClassName: 'fa fa-download blue-text',
    contents: 'Download',
  },
];

export const StepAnalysisGoEnrichmentResults: React.FunctionComponent<StepAnalysisResultPluginProps> =
  ({ analysisResult, analysisConfig, webAppUrl }) => {
    const [wordCloudOpen, setWordCloudOpen] = useState(false);

    return (
      <Fragment>
        <StepAnalysisButtonArray
          configs={goButtonsConfigFactory(
            analysisConfig.stepId,
            analysisConfig.analysisId,
            analysisResult,
            webAppUrl,
            setWordCloudOpen
          )}
        />
        <h3>Analysis Results: </h3>
        <CommonResultTable
          emptyResultMessage={
            'No enrichment was found with significance at the P-value threshold you specified.'
          }
          rows={analysisResult.resultData}
          columns={goEnrichmentResultColumns.map((column) =>
            column.key === 'goId'
              ? {
                  ...column,
                  renderCell: goIdRenderFactory(analysisResult.goTermBaseUrl),
                }
              : column
          )}
          initialSortColumnKey={'pValue'}
          fixedTableHeader
        />
        <WordCloudModal
          imgUrl={`${webAppUrl}/service/users/current/steps/${
            analysisConfig.stepId
          }/analyses/${analysisConfig.analysisId}/resources?path=${
            analysisResult.imageDownloadPath
          }&_=${Date.now()}`}
          open={wordCloudOpen}
          onClose={() => {
            setWordCloudOpen(false);
          }}
          toolName={'GO Enrichment Analysis'}
        />
      </Fragment>
    );
  };
