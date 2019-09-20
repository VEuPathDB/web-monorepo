import * as AnswerActions from 'wdk-client/Actions/AnswerActions';
import * as AttributeAnalysisActions from 'wdk-client/Actions/AttributeAnalysisActions';
import * as DownloadFormActions from 'wdk-client/Actions/DownloadFormActions';
import * as BasketActions from 'wdk-client/Actions/BasketActions';
import * as FavoritesActions from 'wdk-client/Actions/FavoritesActions';
import * as RouterActions from 'wdk-client/Actions/RouterActions';
import * as QuestionActions from 'wdk-client/Actions/QuestionActions';
import * as QuestionWithParametersActions from 'wdk-client/Actions/QuestionWithParametersActions';
import * as FilterParamActions from 'wdk-client/Actions/FilterParamActions';
import * as DatasetParamActions from 'wdk-client/Actions/DatasetParamActions';
import * as TreeBoxEnumParamActions from 'wdk-client/Actions/TreeBoxEnumParamActions';
import * as UserActions from 'wdk-client/Actions/UserActions';
import * as UserCommentFormActions from 'wdk-client/Actions/UserCommentFormActions';
import * as UserCommentShowActions from 'wdk-client/Actions/UserCommentShowActions';
import * as RecordActions from 'wdk-client/Actions/RecordActions';
import * as StaticDataActions from 'wdk-client/Actions/StaticDataActions';
import * as SiteMapActions from 'wdk-client/Actions/SiteMapActions';
import * as UserDatasetsActions from 'wdk-client/Actions/UserDatasetsActions';
import * as ResultTableSummaryViewActions from 'wdk-client/Actions/SummaryView/ResultTableSummaryViewActions';
import * as BlastSummaryViewActions from 'wdk-client/Actions/SummaryView/BlastSummaryViewActions';
import * as GenomeSummaryViewActions from 'wdk-client/Actions/SummaryView/GenomeSummaryViewActions';
import * as ImportStrategyActions from 'wdk-client/Actions/ImportStrategyActions';
import * as StrategyPanelActions from 'wdk-client/Actions/StrategyPanelActions';
import * as StrategyActions from 'wdk-client/Actions/StrategyActions';
import * as StrategyWorkspaceActions from 'wdk-client/Actions/StrategyWorkspaceActions';
import * as StrategyListActions from 'wdk-client/Actions/StrategyListActions';
import * as PublicStrategyActions from 'wdk-client/Actions/PublicStrategyActions';
import * as WordCloudAnalysisActions from 'wdk-client/Actions/WordCloudAnalysisActions';
import * as HistogramAnalysisActions from 'wdk-client/Actions/HistogramAnalysisActions';
import * as MatchedTranscriptsFilterActions from 'wdk-client/Actions/MatchedTranscriptsFilterActions';
import * as ResultPanelActions from 'wdk-client/Actions/ResultPanelActions';
import * as UnhandledErrorActions from 'wdk-client/Actions/UnhandledErrorActions';
import * as UserSessionActions from 'wdk-client/Actions/UserSessionActions';
// FIXME Change this when StepAnalysis is moved out of `MoveAfterRefactor`
import { StepAnalysisAction } from 'wdk-client/Core/MoveAfterRefactor/Actions/StepAnalysis/StepAnalysisActions';

export {
  AnswerActions,
  AttributeAnalysisActions,
  BasketActions,
  DownloadFormActions,
  FavoritesActions,
  RouterActions,
  QuestionActions,
  QuestionWithParametersActions,
  FilterParamActions,
  DatasetParamActions,
  TreeBoxEnumParamActions,
  UserActions,
  RecordActions,
  ImportStrategyActions,
  SiteMapActions,
  StaticDataActions,
  StrategyPanelActions,
  StrategyActions,
  StrategyWorkspaceActions,
  StrategyListActions,
  PublicStrategyActions,
  UserDatasetsActions,
  ResultTableSummaryViewActions,
  BlastSummaryViewActions,
  GenomeSummaryViewActions,
  WordCloudAnalysisActions,
  HistogramAnalysisActions,
  MatchedTranscriptsFilterActions,
  ResultPanelActions,
  UserCommentFormActions,
  UserCommentShowActions,
  UserSessionActions,
};

export type Action =
  | AnswerActions.Action
  | AttributeAnalysisActions.Action
  | BasketActions.Action
  | DownloadFormActions.Action
  | FavoritesActions.Action
  | RouterActions.Action
  | QuestionActions.Action
  | QuestionWithParametersActions.Action
  | FilterParamActions.Action
  | DatasetParamActions.Action
  | TreeBoxEnumParamActions.Action
  | UserActions.Action
  | RecordActions.Action
  | ImportStrategyActions.Action
  | SiteMapActions.Action
  | StaticDataActions.Action
  | StrategyActions.Action
  | StrategyWorkspaceActions.Action
  | StrategyPanelActions.Action
  | StrategyListActions.Action
  | PublicStrategyActions.Action
  | UserDatasetsActions.Action
  | UserCommentFormActions.Action
  | UserCommentShowActions.Action
  | ResultTableSummaryViewActions.Action
  | BlastSummaryViewActions.Action
  | GenomeSummaryViewActions.Action
  | WordCloudAnalysisActions.Action
  | HistogramAnalysisActions.Action
  | MatchedTranscriptsFilterActions.Action
  | ResultPanelActions.Action
  | UnhandledErrorActions.Action
  | MatchedTranscriptsFilterActions.Action
  | UserSessionActions.Action
  | StepAnalysisAction
