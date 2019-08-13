import React from 'react';
import { 
  GenomeSummaryViewPlugin,
  BlastSummaryViewPlugin,
  MatchedTranscriptsFilterPlugin,
  ResultTableSummaryViewPlugin
} from 'wdk-client/Plugins';

import PopsetResultSummaryViewTableController from './components/controllers/PopsetResultSummaryViewTableController';
import CompoundsByFoldChangeForm from './components/questions/CompoundsByFoldChangeForm';
import BlastQuestionForm from './components/questions/BlastQuestionForm';

import { ColocateStepBoxIcon } from './components/strategies/ColocateStepBoxIcon';
import { ColocateStepMenu } from './components/strategies/ColocateStepMenu';
import { ColocateStepForm } from './components/strategies/ColocateStepForm';

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
    type: 'questionForm',
    name: 'CompoundsByFoldChange',
    component: CompoundsByFoldChangeForm
  },
  {
    type: 'questionForm',
    test: ({ question }) => question && question.urlSegment.endsWith('BySimilarity'),
    component: BlastQuestionForm
  },
  {
    type: 'addStepOperationMenu',
    name: 'colocate',
    component: ColocateStepMenu
  },
  {
    type: 'addStepOperationForm',
    name: 'colocate',
    component: ColocateStepForm
  },
  {
    type: 'stepBoxIcon',
    test: ({ question }) => question && question.urlSegment.endsWith('BySpanLogic'),
    component: ColocateStepBoxIcon
  }
];
