import * as downloadForm from '../../Views/ReporterForm/DownloadFormStoreModule';
import * as globalData from './StoreModules/GlobalData';
import * as passwordChange from '../../Views/User/Password/UserPasswordChangeStoreModule';
import * as passwordReset from '../../Views/User/Password/UserPasswordResetStoreModule';
import * as userDatasetDetail from '../../Views/UserDatasets/Detail/UserDatasetDetailStoreModule';
import * as userDatasetList from '../../Views/UserDatasets/List/UserDatasetListStoreModule';
import * as userProfile from '../../Views/User/Profile/UserProfileReducer';
import * as userRegistration from '../../Views/User/Profile/UserRegistrationModule';

export default {
  downloadForm,
  globalData,
  passwordChange,
  passwordReset,
  userDatasetDetail,
  userDatasetList,
  userProfile,
  userRegistration,
};