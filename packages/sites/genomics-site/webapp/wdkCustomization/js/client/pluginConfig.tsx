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
} from 'wdk-client/Plugins';
import { ClientPluginRegistryEntry } from 'wdk-client/Utils/ClientPlugin';

import { ByGenotypeNumberCheckbox } from './components/questions/ByGenotypeNumberCheckbox';

import PopsetResultSummaryViewTableController from './components/controllers/PopsetResultSummaryViewTableController';
import { ByGenotypeNumber } from './components/questions/ByGenotypeNumber';
import { ByLocation } from './components/questions/ByLocation';
import { BlastQuestionForm } from './components/questions/BlastQuestionForm';
import { DynSpansBySourceId } from './components/questions/DynSpansBySourceId';
import { CompoundsByFoldChangeForm, GenericFoldChangeForm } from './components/questions/foldChange';
import { GenesByBindingSiteFeature } from './components/questions/GenesByBindingSiteFeature';
import { GenesByOrthologPattern } from './components/questions/GenesByOrthologPattern';
import { InternalGeneDataset } from './components/questions/InternalGeneDataset';

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
    test: ({ question }) =>
      question?.properties?.datasetCategory != null &&
      question?.properties?.datasetSubtype != null,
    component: InternalGeneDataset
  },
  {
    type: 'questionForm',
    searchName: 'ByGenotypeNumber',
    component: ByGenotypeNumber
  },
  {
    type: 'questionForm',
    test: ({ question }) => !!(
      question && 
      question.urlSegment.endsWith('ByLocation')
    ),
    component: ByLocation
  },
  {
    type: 'questionForm',
    test: ({ question }) =>
      question?.properties?.datasetCategory != null &&
      question?.properties?.datasetSubtype != null,
    component: InternalGeneDataset
  },
  {
    type: 'questionForm',
    name: 'CompoundsByFoldChange',
    component: CompoundsByFoldChangeForm
  },
  {
    type: 'questionForm',
    test: ({ question }) => 
      (
        question?.queryName === 'GenesByGenericFoldChange' ||
        question?.queryName === 'GenesByRnaSeqFoldChange' ||
        question?.queryName === 'GenesByUserDatasetRnaSeq'
      ),
    component: GenericFoldChangeForm,
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
];

export default apiPluginConfig;
