import * as answerView from 'wdk-client/StoreModules/AnswerViewStoreModule';
import * as attributeAnalysis from 'wdk-client/StoreModules/AttributeAnalysisStoreModule';
import * as downloadForm from 'wdk-client/StoreModules/DownloadFormStoreModule';
import * as favorites from 'wdk-client/StoreModules/FavoritesListStoreModule';
import * as globalData from 'wdk-client//StoreModules/GlobalData';
import * as passwordChange from 'wdk-client/StoreModules/UserPasswordChangeStoreModule';
import * as passwordReset from 'wdk-client/StoreModules/UserPasswordResetStoreModule';
import * as question from 'wdk-client/StoreModules/QuestionStoreModule';
import * as record from 'wdk-client/StoreModules/RecordStoreModule';
import * as siteMap from 'wdk-client/StoreModules/SiteMapStoreModule';
import * as userDatasetDetail from 'wdk-client/StoreModules/UserDatasetDetailStoreModule';
import * as userDatasetList from 'wdk-client/StoreModules/UserDatasetListStoreModule';
import * as userProfile from 'wdk-client/StoreModules/UserProfileStoreModule';
import * as userRegistration from 'wdk-client/StoreModules/UserRegistrationStoreModule';
import * as blastSummaryView from 'wdk-client/StoreModules/BlastSummaryViewStoreModule';
import * as genomeSummaryView from 'wdk-client/StoreModules/GenomeSummaryViewStoreModule';
import * as resultTableSummaryView from 'wdk-client/StoreModules/ResultTableSummaryViewStoreModule';
import * as stepAnalysis from 'wdk-client/Core/MoveAfterRefactor/StoreModules/StepAnalysisStoreModule';
import * as steps from 'wdk-client/StoreModules/StepsStoreModule';
import * as wordCloudAnalysis from 'wdk-client/StoreModules/WordCloudAnalysisStoreModule';
import * as histogramAnalysis from 'wdk-client/StoreModules/HistogramAnalysisStoreModule';
import * as basket from 'wdk-client/StoreModules/BasketStoreModule';
import * as resultPanel from 'wdk-client/StoreModules/ResultPanelStoreModule';
import * as unhandledErrors from 'wdk-client/StoreModules/UnhandledErrorStoreModule';
import * as matchedTranscriptsFilter from 'wdk-client/StoreModules/MatchedTranscriptsFilterStoreModule';
import * as userCommentForm from 'wdk-client/StoreModules/UserCommentFormStoreModule';
import * as userCommentShow from 'wdk-client/StoreModules/UserCommentShowStoreModule';
import * as userSession from 'wdk-client/StoreModules/UserSessionStoreModule';

export default {
  answerView,
  attributeAnalysis,
  blastSummaryView,
  downloadForm,
  favorites,
  genomeSummaryView,
  globalData,
  passwordChange,
  passwordReset,
  question,
  record,
  resultTableSummaryView,
  siteMap,
  steps,
  stepAnalysis,
  userCommentForm,
  userCommentShow,
  userDatasetDetail,
  userDatasetList,
  userProfile,
  userRegistration,
  wordCloudAnalysis,
  histogramAnalysis,
  basket,
  resultPanel,
  unhandledErrors,
  matchedTranscriptsFilter,
  userSession
};
