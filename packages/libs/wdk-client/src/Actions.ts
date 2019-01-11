import * as AnswerActions from 'wdk-client/Actions/AnswerActions';
import * as AttributeAnalysisActions from 'wdk-client/Actions/AttributeAnalysisActions';
import * as DownloadFormActions from 'wdk-client/Actions/DownloadFormActions';
import * as BasketActions from 'wdk-client/Actions/BasketActions';
import * as FavoritesActions from 'wdk-client/Actions/FavoritesActions';
import * as RouterActions from 'wdk-client/Actions/RouterActions';
import * as QuestionActions from 'wdk-client/Actions/QuestionActions';
import * as FilterParamActions from 'wdk-client/Actions/FilterParamActions';
import * as DatasetParamActions from 'wdk-client/Actions/DatasetParamActions';
import * as TreeBoxEnumParamActions from 'wdk-client/Actions/TreeBoxEnumParamActions';
import * as UserActions from 'wdk-client/Actions/UserActions';
import * as RecordActions from 'wdk-client/Actions/RecordActions';
import * as StaticDataActions from 'wdk-client/Actions/StaticDataActions';
import * as SiteMapActions from 'wdk-client/Actions/SiteMapActions';
import * as UserDatasetsActions from 'wdk-client/Actions/UserDatasetsActions';
import * as ResultTableSummaryViewActions from 'wdk-client/Actions/SummaryView/ResultTableSummaryViewActions';
import * as BlastSummaryViewActions from 'wdk-client/Actions/SummaryView/BlastSummaryViewActions';
import * as IsolatesSummaryViewActions from 'wdk-client/Actions/SummaryView/IsolatesSummaryViewActions';
import * as GenomeSummaryViewActions from 'wdk-client/Actions/SummaryView/GenomeSummaryViewActions';
import * as StepActions from 'wdk-client/Actions/StepActions';
import * as WordCloudAnalysisActions from 'wdk-client/Actions/WordCloudAnalysisActions';
import * as HistogramAnalysisActions from 'wdk-client/Actions/HistogramAnalysisActions';
import * as MatchedTranscriptsFilterActions from 'wdk-client/Actions/MatchedTranscriptsFilterActions';

export {
  AnswerActions,
  AttributeAnalysisActions,
  BasketActions,
  DownloadFormActions,
  FavoritesActions,
  RouterActions,
  QuestionActions,
  FilterParamActions,
  DatasetParamActions,
  TreeBoxEnumParamActions,
  UserActions,
  RecordActions,
  SiteMapActions,
  StaticDataActions,
  StepActions,
  UserDatasetsActions,
  ResultTableSummaryViewActions,
  BlastSummaryViewActions,
  IsolatesSummaryViewActions,
  GenomeSummaryViewActions,
  WordCloudAnalysisActions,
  HistogramAnalysisActions,
  MatchedTranscriptsFilterActions,
};

export type Action =
  | AnswerActions.Action
  | AttributeAnalysisActions.Action
  | BasketActions.Action
  | DownloadFormActions.Action
  | FavoritesActions.Action
  | RouterActions.Action
  | QuestionActions.Action
  | FilterParamActions.Action
  | DatasetParamActions.Action
  | TreeBoxEnumParamActions.Action
  | UserActions.Action
  | RecordActions.Action
  | SiteMapActions.Action
  | StaticDataActions.Action
  | StepActions.Action
  | UserDatasetsActions.Action
  | ResultTableSummaryViewActions.Action
  | BlastSummaryViewActions.Action
  | IsolatesSummaryViewActions.Action
  | GenomeSummaryViewActions.Action
  | WordCloudAnalysisActions.Action
  | HistogramAnalysisActions.Action
  | MatchedTranscriptsFilterActions.Action
