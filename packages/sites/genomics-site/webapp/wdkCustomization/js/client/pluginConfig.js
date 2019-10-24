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
    name: '_default',
    recordClassName: 'UserFileRecords.UserFile',
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
