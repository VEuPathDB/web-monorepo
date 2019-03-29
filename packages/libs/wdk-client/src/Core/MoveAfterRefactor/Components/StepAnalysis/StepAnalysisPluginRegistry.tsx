import React, { ReactNode } from 'react';

import { StepAnalysisFormPluginProps } from './StepAnalysisFormPane';
import { StepAnalysisDefaultForm } from './StepAnalysisDefaultForm';
import { StepAnalysisResultPluginProps } from './StepAnalysisResultsPane';
import { StepAnalysisWordEnrichmentResults } from './StepAnalysisWordEnrichmentResults';
import { StepAnalysisPathwayEnrichmentResults } from './StepAnalysisPathwayEnrichmentResults';
import { StepAnalysisGoEnrichmentResults } from './StepAnalysisGoEnrichmentResults';
import { StepAnalysisEupathExternalResult } from './StepAnalysisEupathExternalResult';
import { StepAnalysisHpiGeneListResults } from './StepAnalysisHpiGeneListResults';

interface FormPluginEntry {
  formRenderer: (props: StepAnalysisFormPluginProps) => ReactNode;
  initialFormUiState: any;
}

interface ResultPluginEntry {
  resultRenderer: (props: StepAnalysisResultPluginProps) => ReactNode;
  initialResultUiState: any;
}

const formPlugins: Record<string, FormPluginEntry> = {
  defaultAnalysisForm: {
    formRenderer: StepAnalysisDefaultForm,
    initialFormUiState: {}
  },
  'word-enrichment': {
    formRenderer: StepAnalysisDefaultForm,
    initialFormUiState: {}
  },
  'pathway-enrichment': {
    formRenderer: StepAnalysisDefaultForm,
    initialFormUiState: {}
  },
  'go-enrichment': {
    formRenderer: StepAnalysisDefaultForm,
    initialFormUiState: {}
  },
  'datasetGeneList': {
    formRenderer: StepAnalysisDefaultForm,
    initialFormUiState: {}
  }
};

const resultPlugins: Record<string, ResultPluginEntry> = {
  defaultAnalysisResult: {
    resultRenderer: ({ analysisResult }) => <pre>{JSON.stringify(analysisResult)}</pre>,
    initialResultUiState: {}
  },
  'word-enrichment': {
    resultRenderer: StepAnalysisWordEnrichmentResults,
    initialResultUiState: {}
  },
  'pathway-enrichment': {
    resultRenderer: StepAnalysisPathwayEnrichmentResults,
    initialResultUiState: {
      wordCloudOpen: false
    }
  },
  'go-enrichment': {
    resultRenderer: StepAnalysisGoEnrichmentResults,
    initialResultUiState: {
      wordCloudOpen: false
    }
  },
  'otu_abundance': {
    resultRenderer: StepAnalysisEupathExternalResult,
    initialResultUiState: {}
  },
  'alpha_diversity': {
    resultRenderer: StepAnalysisEupathExternalResult,
    initialResultUiState: {}
  },
  'beta_diversity': {
    resultRenderer: StepAnalysisEupathExternalResult,
    initialResultUiState: {}
  },
  'transcript-length-dist': {
    resultRenderer: StepAnalysisEupathExternalResult,
    initialResultUiState: {}
  },
  'differential_abundance': {
    resultRenderer: StepAnalysisEupathExternalResult,
    initialResultUiState: {}
  },
  'correlation_app': {
    resultRenderer: StepAnalysisEupathExternalResult,
    initialResultUiState: {}
  },
  'person-graph-analysis': {
    resultRenderer: StepAnalysisEupathExternalResult,
    initialResultUiState: {}
  },
  'light-trap-plots': {
    resultRenderer: StepAnalysisEupathExternalResult,
    initialResultUiState: {}
  },
  'clinepi-cont-table': {
    resultRenderer: StepAnalysisEupathExternalResult,
    initialResultUiState: {}
  },
  'clinepi-event-dist': {
    resultRenderer: StepAnalysisEupathExternalResult,
    initialResultUiState: {}
  },
  'clinepi-summaries': {
    resultRenderer: StepAnalysisEupathExternalResult,
    initialResultUiState: {}
  },
  'datasetGeneList': {
    resultRenderer: StepAnalysisHpiGeneListResults,
    initialResultUiState: {}
  }
};

export const locateFormPlugin = (name: string) => formPlugins[name] || formPlugins.defaultAnalysisForm;
export const locateResultPlugin = (name: string) => resultPlugins[name] || resultPlugins.defaultAnalysisResult;
