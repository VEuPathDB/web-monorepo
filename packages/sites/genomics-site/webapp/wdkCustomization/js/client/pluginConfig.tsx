import React from 'react';
import { 
  GenomeSummaryViewPlugin,
  BlastSummaryViewPlugin,
  MatchedTranscriptsFilterPlugin,
  ResultTableSummaryViewPlugin,
  StepAnalysisWordEnrichmentResults,
  StepAnalysisPathwayEnrichmentResults,
  StepAnalysisGoEnrichmentResults,
  StepAnalysisEupathExternalResult,
  StepAnalysisHpiGeneListResults,
} from '@veupathdb/wdk-client/lib/Plugins';
import { ClientPluginRegistryEntry } from '@veupathdb/wdk-client/lib/Utils/ClientPlugin';

import { ByGenotypeNumberCheckbox } from './components/questions/ByGenotypeNumberCheckbox';

import PopsetResultSummaryViewTableController from './components/controllers/PopsetResultSummaryViewTableController';
import { BlastQuestionForm } from './components/questions/BlastQuestionForm';
import { ByGenotypeNumber } from './components/questions/ByGenotypeNumber';
import { ByLocationForm, ByLocationStepDetails } from './components/questions/ByLocation';
import { DynSpansBySourceId } from './components/questions/DynSpansBySourceId';
import { GenesByBindingSiteFeature } from './components/questions/GenesByBindingSiteFeature';
import { GenesByOrthologPattern } from './components/questions/GenesByOrthologPattern';
import { InternalGeneDataset } from './components/questions/InternalGeneDataset';
import { hasChromosomeAndSequenceIDXorGroup } from './components/questions/MutuallyExclusiveParams/utils';
import { OrganismParam, isOrganismParam } from './components/questions/OrganismParam';
import { CompoundsByFoldChangeForm, GenericFoldChangeForm } from './components/questions/foldChange';

import { BlastForm } from '@veupathdb/multi-blast/lib/components/BlastForm';

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
    component: BlastSummaryViewPlugin
  },
  {
    type: 'summaryView',
    name: 'popset-view',
    component: () => <div style={{margin: "2em", fontSize: "120%", fontWeight: "bold"}}>
                       The Popset Isolate Sequences geographical map is not available since Google 
                         has changed its Maps API products business model.<br/>
                       We are working on a new and improved map for a future release.<br/>
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
    name: 'GenesByMultiBlast',
    component: BlastForm,
  },
  {
    type: 'questionFormParameter',
    name: 'tfbs_name',
    searchName: 'GenesByBindingSiteFeature',
    component: GenesByBindingSiteFeature
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
