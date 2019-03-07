import { 
  GenomeSummaryViewPlugin,
  BlastSummaryViewPlugin,
  MatchedTranscriptsFilterPlugin,
} from 'wdk-client/Plugins';

import PopsetResultSummaryViewTableController from './components/controllers/PopsetResultSummaryViewTableController';

export default [
  {
    type: 'summaryView',
    name: '_default',
    recordClassName: 'PopsetRecordClasses.PopsetRecordClass',
    component: PopsetResultSummaryViewTableController
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
    component: () => <div>TODO</div>
  },
  {
    type: 'questionFilter',
    name: 'matched_transcript_filter_array',
    component: MatchedTranscriptsFilterPlugin
  },
  {
    type: 'questionFilter',
    name: 'gene_boolean_filter_array',
    component: MatchedTranscriptsFilterPlugin
  }
];
