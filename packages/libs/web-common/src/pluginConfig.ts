import {
  HistogramAnalysisPlugin,
  WordCloudAnalysisPlugin,
  StepAnalysisViewPlugin,
  ResultTableSummaryViewPlugin,
  StepAnalysisDefaultForm,
  StepAnalysisDefaultResult,
} from '@veupathdb/wdk-client/lib/Plugins';
import { ClientPluginRegistryEntry } from '@veupathdb/wdk-client/lib/Utils/ClientPlugin';
import { StepAnalysisEupathExternalResult } from './plugins/StepAnalysisEupathExternalResult';

import { EbrcDefaultQuestionForm } from './components/questions/EbrcDefaultQuestionForm';
import { RadioParams } from './plugins/RadioParams';
import QuestionWizardPlugin from './plugins/QuestionWizardPlugin';

/**
 * EBRC Plugin Configuration
 *
 * This file provides VEuPathDB-specific plugin implementations shared across
 * all EBRC/VEuPathDB sites. These plugins extend the base WDK functionality
 * with features common to all VEuPathDB projects.
 *
 * For comprehensive documentation on the plugin system and these specific plugins, see:
 * - Plugin System Architecture: @veupathdb/wdk-client/lib/Utils/PLUGIN_SYSTEM.md
 * - EBRC Plugin Details: ./EBRC_PLUGINS.md
 *
 * Plugin Hierarchy:
 * 1. Site-specific plugins (highest precedence) - e.g., genomics-site/pluginConfig.tsx
 * 2. EBRC shared plugins (medium precedence) - THIS FILE
 * 3. WDK base plugins (lowest precedence) - @veupathdb/wdk-client/lib/Core/pluginConfig
 *
 * The plugins in this file provide:
 * - Analysis tools: Word clouds, histograms
 * - Enhanced forms: Wizard interface, radio parameter layout, EBRC default styling
 * - Step analysis support: Microbiome analyses (OTU, diversity) and ClinEpi analyses
 * - Default views: Enhanced result table views, step analysis displays
 */

const ebrcPluginConfig: ClientPluginRegistryEntry<any>[] = [
  {
    type: 'attributeAnalysis',
    name: 'wordCloud',
    component: WordCloudAnalysisPlugin,
  },
  {
    type: 'attributeAnalysis',
    name: 'histogram',
    component: HistogramAnalysisPlugin,
  },
  {
    type: 'stepAnalysisView',
    name: 'defaultStepAnalysisView',
    component: StepAnalysisViewPlugin,
  },
  {
    type: 'summaryView',
    name: '_default',
    component: ResultTableSummaryViewPlugin,
  },
  {
    type: 'questionController',
    test: ({ question }) =>
      question?.properties?.websiteProperties?.includes('useWizard') ?? false,
    component: QuestionWizardPlugin,
  },
  {
    type: 'questionForm',
    test: ({ question }) => question?.properties?.['radio-params'] != null,
    component: RadioParams,
  },
  {
    type: 'questionForm',
    component: EbrcDefaultQuestionForm,
  },
  {
    type: 'stepAnalysisForm',
    component: StepAnalysisDefaultForm,
  },
  {
    type: 'stepAnalysisResult',
    name: 'otu_abundance',
    component: StepAnalysisEupathExternalResult,
  },
  {
    type: 'stepAnalysisResult',
    name: 'alpha_diversity',
    component: StepAnalysisEupathExternalResult,
  },
  {
    type: 'stepAnalysisResult',
    name: 'beta_diversity',
    component: StepAnalysisEupathExternalResult,
  },
  {
    type: 'stepAnalysisResult',
    name: 'differential_abundance',
    component: StepAnalysisEupathExternalResult,
  },
  {
    type: 'stepAnalysisResult',
    name: 'correlation_app',
    component: StepAnalysisEupathExternalResult,
  },
  {
    type: 'stepAnalysisResult',
    name: 'person-graph-analysis',
    component: StepAnalysisEupathExternalResult,
  },
  {
    type: 'stepAnalysisResult',
    name: 'light-trap-plots',
    component: StepAnalysisEupathExternalResult,
  },
  {
    type: 'stepAnalysisResult',
    name: 'clinepi-cont-table',
    component: StepAnalysisEupathExternalResult,
  },
  {
    type: 'stepAnalysisResult',
    name: 'clinepi-event-dist',
    component: StepAnalysisEupathExternalResult,
  },
  {
    type: 'stepAnalysisResult',
    name: 'clinepi-summaries',
    component: StepAnalysisEupathExternalResult,
  },
  {
    type: 'stepAnalysisResult',
    component: StepAnalysisDefaultResult,
  },
];

export default ebrcPluginConfig;
