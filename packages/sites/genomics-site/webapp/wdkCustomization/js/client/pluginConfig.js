import React from 'react';
import { 
  GenomeSummaryViewPlugin,
  BlastSummaryViewPlugin,
  MatchedTranscriptsFilterPlugin,
  ResultTableSummaryViewPlugin
} from 'wdk-client/Plugins';

import { ByGenotypeNumberCheckbox } from 'wdk-client/Views/Question/Params/ByGenotypeNumberCheckbox/ByGenotypeNumberCheckbox'

import PopsetResultSummaryViewTableController from './components/controllers/PopsetResultSummaryViewTableController';
import { ByGenotypeNumber } from './components/questions/ByGenotypeNumber';
import { ByLocation } from './components/questions/ByLocation';
import BlastQuestionForm from './components/questions/BlastQuestionForm';
import { DynSpansBySourceId } from './components/questions/DynSpansBySourceId';
import { CompoundsByFoldChangeForm, GenericFoldChangeForm } from './components/questions/foldChange';
import { GenesByBindingSiteFeature } from './components/questions/GenesByBindingSiteFeature';
import { InternalGeneDataset } from './components/questions/InternalGeneDataset';
import { RadioParams } from './components/questions/RadioParams';


export default [
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
    test: ({ question }) => !!(
      question && 
      question.properties && 
      question.properties.datasetCategory &&
      question.properties.datasetSubtype
    ),    
    component: InternalGeneDataset
  },
  {
    type: 'questionForm',
    test: ({ question }) => !!(
      question && 
      question.properties && 
      question.properties['radio-params']
    ),
    component: RadioParams
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
    test: ({ question }) => !!(
      question && 
      question.properties && 
      question.properties.datasetCategory &&
      question.properties.datasetSubtype
    ),
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
      !!question && 
      (
        question.queryName === 'GenesByGenericFoldChange' ||
        question.queryName === 'GenesByUserDatasetRnaSeq'
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
    test: ({ question }) => question && question.urlSegment.endsWith('BySimilarity'),
    component: BlastQuestionForm
  },
  {
    type: 'questionFormParameter',
    name: 'genotype',
    searchName: 'ByGenotypeNumber',
    component: ByGenotypeNumberCheckbox
  },
];
