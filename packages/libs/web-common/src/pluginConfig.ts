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
