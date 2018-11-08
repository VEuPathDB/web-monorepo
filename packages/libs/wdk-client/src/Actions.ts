import * as AnswerActions from 'wdk-client/Actions/AnswerActions';
import * as AttributeAnalysisActions from 'wdk-client/Actions/AttributeAnalysisActions';
import * as DownloadFormActions from 'wdk-client/Actions/DownloadFormActions';
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

export {
  AnswerActions,
  AttributeAnalysisActions,
  DownloadFormActions,
  FavoritesActions,
  RouterActions,
  QuestionActions,
  FilterParamActions,
  DatasetParamActions,
  TreeBoxEnumParamActions,
  UserActions,
  RecordActions,
  StaticDataActions,
  SiteMapActions,
  UserDatasetsActions,
};

export type Action =
  | AnswerActions.Action
  | AttributeAnalysisActions.Action
  | DownloadFormActions.Action
  | FavoritesActions.Action
  | RouterActions.Action
  | QuestionActions.Action
  | FilterParamActions.Action
  | DatasetParamActions.Action
  | TreeBoxEnumParamActions.Action
  | UserActions.Action
  | RecordActions.Action
  | StaticDataActions.Action
  | SiteMapActions.Action
  | UserDatasetsActions.Action
