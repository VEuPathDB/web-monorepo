import * as answerView from 'wdk-client/Views/Answer/AnswerViewStoreModule';
import * as attributeAnalysis from 'wdk-client/Views/AttributeAnalysis/AttributeAnalysisStoreModule';
import * as downloadForm from 'wdk-client/Views/ReporterForm/DownloadFormStoreModule';
import * as favorites from 'wdk-client/Views/Favorites/FavoritesListStoreModule';
import * as globalData from 'wdk-client/Core/State/StoreModules/GlobalData';
import * as passwordChange from 'wdk-client/Views/User/Password/UserPasswordChangeStoreModule';
import * as passwordReset from 'wdk-client/Views/User/Password/UserPasswordResetStoreModule';
import * as question from 'wdk-client/Views/Question/QuestionStoreModule';
import * as record from 'wdk-client/Views/Records/RecordStoreModule';
import * as siteMap from 'wdk-client/Views/SiteMap/SiteMapStoreModule';
import * as userDatasetDetail from 'wdk-client/Views/UserDatasets/Detail/UserDatasetDetailStoreModule';
import * as userDatasetList from 'wdk-client/Views/UserDatasets/List/UserDatasetListStoreModule';
import * as userProfile from 'wdk-client/Views/User/Profile/UserProfileReducer';
import * as userRegistration from 'wdk-client/Views/User/Profile/UserRegistrationModule';
import * as blastSummaryView from 'wdk-client/Views/BlastSummaryView/BlastSummaryViewStoreModule';

export default {
  answerView,
  attributeAnalysis,
  blastSummaryView,
  downloadForm,
  favorites,
  globalData,
  passwordChange,
  passwordReset,
  question,
  record,
  siteMap,
  userDatasetDetail,
  userDatasetList,
  userProfile,
  userRegistration,
};