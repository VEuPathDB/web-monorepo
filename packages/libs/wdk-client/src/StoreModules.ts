import * as answerView from './StoreModules/AnswerViewStoreModule';
import * as attributeAnalysis from './StoreModules/AttributeAnalysisStoreModule';
import * as downloadForm from './StoreModules/DownloadFormStoreModule';
import * as favorites from './StoreModules/FavoritesListStoreModule';
import * as globalData from './/StoreModules/GlobalData';
import * as passwordChange from './StoreModules/UserPasswordChangeStoreModule';
import * as passwordReset from './StoreModules/UserPasswordResetStoreModule';
import * as question from './StoreModules/QuestionStoreModule';
import * as questionsWithParameters from './StoreModules/QuestionsWithParametersStoreModule';
import * as record from './StoreModules/RecordStoreModule';
import * as siteMap from './StoreModules/SiteMapStoreModule';
import * as userProfile from './StoreModules/UserProfileStoreModule';
import * as userRegistration from './StoreModules/UserRegistrationStoreModule';
import * as resultTableSummaryView from './StoreModules/ResultTableSummaryViewStoreModule';
import * as stepAnalysis from './StoreModules/StepAnalysisStoreModule';
import * as wordCloudAnalysis from './StoreModules/WordCloudAnalysisStoreModule';
import * as histogramAnalysis from './StoreModules/HistogramAnalysisStoreModule';
import * as basket from './StoreModules/BasketStoreModule';
import * as resultPanel from './StoreModules/ResultPanelStoreModule';
import * as importStrategy from './StoreModules/ImportStrategyStoreModule';
import * as strategies from './StoreModules/StrategyStoreModule';
import * as strategyPanel from './StoreModules/StrategyPanelStoreModule';
import * as strategyWorkspace from './StoreModules/StrategyWorkspaceStoreModule';
import * as strategyList from './StoreModules/StrategyListStoreModule';
import * as publicStrategies from './StoreModules/PublicStrategyStoreModule';
import * as unhandledErrors from './StoreModules/UnhandledErrorStoreModule';
import * as matchedTranscriptsFilter from './StoreModules/MatchedTranscriptsFilterStoreModule';
import * as router from './StoreModules/RouterStoreModule';
import * as userSession from './StoreModules/UserSessionStoreModule';
import * as notification from './StoreModules/NotificationStoreModule';

export default {
  answerView,
  attributeAnalysis,
  downloadForm,
  favorites,
  globalData,
  passwordChange,
  passwordReset,
  question,
  questionsWithParameters,
  record,
  resultTableSummaryView,
  siteMap,
  importStrategy,
  stepAnalysis,
  strategies,
  strategyPanel,
  strategyWorkspace,
  strategyList,
  publicStrategies,
  router,
  userProfile,
  userRegistration,
  wordCloudAnalysis,
  histogramAnalysis,
  basket,
  resultPanel,
  unhandledErrors,
  matchedTranscriptsFilter,
  userSession,
  notification,
};
