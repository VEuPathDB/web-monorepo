import * as answerView from '../../Views/Answer/AnswerViewStoreModule';
import * as attributeAnalysis from '../../Views/AttributeAnalysis/AttributeAnalysisStoreModule';
import * as downloadForm from '../../Views/ReporterForm/DownloadFormStoreModule';
import * as favorites from '../../Views/Favorites/FavoritesListStoreModule';
import * as globalData from './StoreModules/GlobalData';
import * as passwordChange from '../../Views/User/Password/UserPasswordChangeStoreModule';
import * as passwordReset from '../../Views/User/Password/UserPasswordResetStoreModule';
import * as question from '../../Views/Question/QuestionStoreModule';
import * as record from '../../Views/Records/RecordStoreModule';
import * as siteMap from '../../Views/SiteMap/SiteMapStoreModule';
import * as userDatasetDetail from '../../Views/UserDatasets/Detail/UserDatasetDetailStoreModule';
import * as userDatasetList from '../../Views/UserDatasets/List/UserDatasetListStoreModule';
import * as userProfile from '../../Views/User/Profile/UserProfileReducer';
import * as userRegistration from '../../Views/User/Profile/UserRegistrationModule';

export default {
  answerView,
  attributeAnalysis,
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