import React, { ReactNode } from 'react';

import { StepAnalysisFormPluginProps } from './StepAnalysisFormPane';
import { StepAnalysisDefaultForm } from './StepAnalysisDefaultForm';
import { StepAnalysisResultPluginProps } from './StepAnalysisResultsPane';
import { StepAnalysisWordEnrichmentResults } from './StepAnalysisWordEnrichmentResults';
import { StepAnalysisPathwayEnrichmentResults } from './StepAnalysisPathwayEnrichmentResults';
import { StepAnalysisGoEnrichmentResults } from './StepAnalysisGoEnrichmentResults';
import { StepAnalysisExternalResult } from './StepAnalysisExternalResult';

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
    initialResultUiState: {}
  },
  'go-enrichment': {
    resultRenderer: StepAnalysisGoEnrichmentResults,
    initialResultUiState: {}
  },
  'otu_abundance': {
    resultRenderer: StepAnalysisExternalResult,
    initialResultUiState: {}
  },
  'alpha_diversity': {
    resultRenderer: StepAnalysisExternalResult,
    initialResultUiState: {}
  },
  'beta_diversity': {
    resultRenderer: StepAnalysisExternalResult,
    initialResultUiState: {}
  },
  'person-graph-analysis': {
    resultRenderer: StepAnalysisExternalResult,
    initialResultUiState: {}
  },
  'light-trap-plots': {
    resultRenderer: StepAnalysisExternalResult,
    initialResultUiState: {}
  },
  'clinepi-cont-table': {
    resultRenderer: StepAnalysisExternalResult,
    initialResultUiState: {}
  },
  'clinepi-event-dist': {
    resultRenderer: StepAnalysisExternalResult,
    initialResultUiState: {}
  },
  'clinepi-summaries': {
    resultRenderer: StepAnalysisExternalResult,
    initialResultUiState: {}
  }
};

export const locateFormPlugin = (name: string) => formPlugins[name] || formPlugins.defaultAnalysisForm;
export const locateResultPlugin = (name: string) => resultPlugins[name] || resultPlugins.defaultAnalysisResult;
