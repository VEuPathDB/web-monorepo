import * as AnswerActions from './Actions/AnswerActions';
import * as AttributeAnalysisActions from './Actions/AttributeAnalysisActions';
import * as DownloadFormActions from './Actions/DownloadFormActions';
import * as BasketActions from './Actions/BasketActions';
import * as FavoritesActions from './Actions/FavoritesActions';
import * as RouterActions from './Actions/RouterActions';
import * as QuestionActions from './Actions/QuestionActions';
import * as QuestionWithParametersActions from './Actions/QuestionWithParametersActions';
import * as FilterParamActions from './Actions/FilterParamActions';
import * as DatasetParamActions from './Actions/DatasetParamActions';
import * as TreeBoxEnumParamActions from './Actions/TreeBoxEnumParamActions';
import * as UserActions from './Actions/UserActions';
import * as RecordActions from './Actions/RecordActions';
import * as StaticDataActions from './Actions/StaticDataActions';
import * as SiteMapActions from './Actions/SiteMapActions';
import * as ResultTableSummaryViewActions from './Actions/SummaryView/ResultTableSummaryViewActions';
import * as ImportStrategyActions from './Actions/ImportStrategyActions';
import * as StrategyPanelActions from './Actions/StrategyPanelActions';
import * as StrategyActions from './Actions/StrategyActions';
import * as StrategyWorkspaceActions from './Actions/StrategyWorkspaceActions';
import * as StrategyListActions from './Actions/StrategyListActions';
import * as PublicStrategyActions from './Actions/PublicStrategyActions';
import * as WordCloudAnalysisActions from './Actions/WordCloudAnalysisActions';
import * as HistogramAnalysisActions from './Actions/HistogramAnalysisActions';
import * as MatchedTranscriptsFilterActions from './Actions/MatchedTranscriptsFilterActions';
import * as ResultPanelActions from './Actions/ResultPanelActions';
import * as UnhandledErrorActions from './Actions/UnhandledErrorActions';
import * as UserSessionActions from './Actions/UserSessionActions';
import { StepAnalysisAction } from './Actions/StepAnalysis/StepAnalysisActions';
import * as NotificationActions from './Actions/NotificationActions';

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
  ResultTableSummaryViewActions,
  WordCloudAnalysisActions,
  HistogramAnalysisActions,
  MatchedTranscriptsFilterActions,
  ResultPanelActions,
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
  | ResultTableSummaryViewActions.Action
  | WordCloudAnalysisActions.Action
  | HistogramAnalysisActions.Action
  | MatchedTranscriptsFilterActions.Action
  | ResultPanelActions.Action
  | UnhandledErrorActions.Action
  | MatchedTranscriptsFilterActions.Action
  | UserSessionActions.Action
  | StepAnalysisAction
  | NotificationActions.Action;
