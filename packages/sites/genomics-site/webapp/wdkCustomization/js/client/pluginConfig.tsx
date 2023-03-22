import React, { Suspense } from 'react';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import {
  MatchedTranscriptsFilterPlugin,
  ResultTableSummaryViewPlugin,
} from '@veupathdb/wdk-client/lib/Plugins';
import { ClientPluginRegistryEntry } from '@veupathdb/wdk-client/lib/Utils/ClientPlugin';
import { StepAnalysisEupathExternalResult } from '@veupathdb/web-common/lib/plugins/StepAnalysisEupathExternalResult';
import { default as GenomeSummaryViewPlugin } from './controllers/GenomeSummaryViewController'

import { ByGenotypeNumberCheckbox } from './components/questions/ByGenotypeNumberCheckbox';

import PopsetResultSummaryViewTableController from './components/controllers/PopsetResultSummaryViewTableController';
import { BlastQuestionForm } from './components/questions/BlastQuestionForm';
import { ByGenotypeNumber } from './components/questions/ByGenotypeNumber';
import { ByLocationForm, ByLocationStepDetails } from './components/questions/ByLocation';
import { DynSpansBySourceId } from './components/questions/DynSpansBySourceId';
import { GenesByBindingSiteFeature } from './components/questions/GenesByBindingSiteFeature';
import { GenesByWGCNAModules } from './components/questions/GenesByWGCNAModules';
import { GenesByOrthologPattern } from './components/questions/GenesByOrthologPattern';
import { InternalGeneDataset } from './components/questions/InternalGeneDataset';
import { hasChromosomeAndSequenceIDXorGroup } from './components/questions/MutuallyExclusiveParams/utils';
import { CompoundsByFoldChangeForm, GenericFoldChangeForm } from './components/questions/foldChange';
import { StepAnalysisPathwayEnrichmentResults } from './components/stepAnalysis/StepAnalysisPathwayEnrichmentResults'
import { StepAnalysisGoEnrichmentResults } from './components/stepAnalysis/StepAnalysisGoEnrichmentResults'
import { StepAnalysisHpiGeneListResults } from './components/stepAnalysis/StepAnalysisHpiGeneListResults'
import { StepAnalysisWordEnrichmentResults } from './components/stepAnalysis/StepAnalysisWordEnrichmentResults'

import { isMultiBlastQuestion } from '@veupathdb/multi-blast/lib/utils/pluginConfig';

import { OrganismParam, isOrganismParam } from '@veupathdb/preferred-organisms/lib/components/OrganismParam';

const BlastForm = React.lazy(() => import('./plugins/BlastForm'));
const BlastQuestionController = React.lazy(() => import('./plugins/BlastQuestionController'));
const BlastSummaryViewPlugin = React.lazy(
  () => import('@veupathdb/blast-summary-view/lib/Controllers/BlastSummaryViewController')
);

const isInternalGeneDatasetQuestion: ClientPluginRegistryEntry<any>['test'] =
  ({ question }) => (
    question?.properties?.datasetCategory != null &&
    question?.properties?.datasetSubtype != null
  );

const isMutuallyExclusiveParamQuestion: ClientPluginRegistryEntry<any>['test'] =
  ({ question }) => (
    question != null &&
    question.urlSegment.endsWith('ByLocation') &&
    hasChromosomeAndSequenceIDXorGroup(question)
  );

const apiPluginConfig: ClientPluginRegistryEntry<any>[] = [
  {
    type: 'summaryView',
    name: '_default',
    recordClassName: 'popsetSequence',
    component: PopsetResultSummaryViewTableController
  },
  {
    type: 'summaryView',
    name: '_default',
    recordClassName: 'file',
    component: ResultTableSummaryViewPlugin.withOptions({
      showIdAttributeColumn: false
    })
  },
  {
    type: 'summaryView',
    name: 'genomic-view',
    component: GenomeSummaryViewPlugin
  },
  {
    type: 'summaryView',
    name: 'blast-view',
    component: (props) =>
      <Suspense fallback={<Loading />}>
        <BlastSummaryViewPlugin {...props} />
      </Suspense>
  },
  {
    type: 'summaryView',
    name: 'popset-view',
    component: () => <div style={{ margin: "2em", fontSize: "120%", fontWeight: "bold" }}>
      The Popset Isolate Sequences geographical map is not available since Google
                         has changed its Maps API products business model.<br />
                       We are working on a new and improved map for a future release.<br />
                       Feel free to <a href='/a/app/contact-us'>contact us</a> with any comments and suggestions.
                     </div>
  },
  // Note that we are leaving out the organism filter from here. It is being added in a different way.
  {
    type: 'questionFilter',
    name: 'matched_transcript_filter_array',
    component: MatchedTranscriptsFilterPlugin
  },
  {
    type: 'questionFilter',
    name: 'gene_boolean_filter_array',
    component: MatchedTranscriptsFilterPlugin
  },
  {
    type: 'questionController',
    test: isInternalGeneDatasetQuestion,
    component: InternalGeneDataset
  },
  {
    type: 'questionController',
    test: isMultiBlastQuestion,
    component: (props) =>
      <Suspense fallback={<Loading />}>
        <BlastQuestionController {...props} />
      </Suspense>
  },
  {
    type: 'questionForm',
    name: 'ByGenotypeNumber',
    component: ByGenotypeNumber
  },
  {
    type: 'questionForm',
    test: isMutuallyExclusiveParamQuestion,
    component: ByLocationForm
  },
  {
    type: 'questionForm',
    test: isInternalGeneDatasetQuestion,
    component: InternalGeneDataset
  },
  {
    type: 'questionForm',
    test: ({ question }) => (
      !!question?.queryName?.startsWith('CompoundsByFoldChange')
    ),
    component: CompoundsByFoldChangeForm
  },
  {
    type: 'questionForm',
    test: ({ question }) => (
      question?.queryName === 'GenesByGenericFoldChange' ||
      question?.queryName === 'GenesByRnaSeqFoldChange' ||
      question?.queryName === 'GenesByUserDatasetRnaSeq'
    ),
    component: GenericFoldChangeForm,
  },
  {
    type: 'questionForm',
    test: ({ question }) => (
      question != null &&
      question.urlSegment.endsWith('MultiBlast')
    ),
    component: (props) =>
      <Suspense fallback={<Loading />}>
        <BlastForm {...props} />
      </Suspense>,
  },
  {
    type: 'questionFormParameter',
    name: 'tfbs_name',
    searchName: 'GenesByBindingSiteFeature',
    component: GenesByBindingSiteFeature
  },
  {
    type: 'questionFormParameter',
    test: ({ question }) => (
      question?.queryName === 'GenesByWGCNAModule'
    ),
    component: GenesByWGCNAModules
  },
  {
    type: 'questionForm',
    name: 'DynSpansBySourceId',
    component: DynSpansBySourceId
  },
  {
    type: 'questionForm',
    test: ({ question }) =>
      question?.urlSegment.endsWith('BySimilarity') ||
      question?.urlSegment === 'UnifiedBlast',
    component: BlastQuestionForm
  },
  {
    type: 'questionForm',
    name: 'GenesByOrthologPattern',
    component: GenesByOrthologPattern
  },
  {
    type: 'questionFormParameter',
    name: 'genotype',
    searchName: 'ByGenotypeNumber',
    component: ByGenotypeNumberCheckbox
  },
  {
    type: 'questionFormParameter',
    test: ({ parameter }) => (
      parameter != null &&
      isOrganismParam(parameter)
    ),
    component: OrganismParam
  },
  {
    type: 'stepAnalysisResult',
    name: 'word-enrichment',
    component: StepAnalysisWordEnrichmentResults
  },
  {
    type: 'stepAnalysisResult',
    name: 'pathway-enrichment',
    component: StepAnalysisPathwayEnrichmentResults
  },
  {
    type: 'stepAnalysisResult',
    name: 'go-enrichment',
    component: StepAnalysisGoEnrichmentResults
  },
  {
    type: 'stepAnalysisResult',
    name: 'transcript-length-dist',
    component: StepAnalysisEupathExternalResult
  },
  {
    type: 'stepAnalysisResult',
    name: 'datasetGeneList',
    component: StepAnalysisHpiGeneListResults
  },
  {
    type: 'stepDetails',
    test: isMutuallyExclusiveParamQuestion,
    component: ByLocationStepDetails
  },
];

export default apiPluginConfig;
