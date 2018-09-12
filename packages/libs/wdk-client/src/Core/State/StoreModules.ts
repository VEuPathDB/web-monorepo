import * as globalData from './StoreModules/GlobalData';
import * as downloadForm from '../../Views/ReporterForm/DownloadFormStoreModule';
import * as userProfile from '../../Views/User/Profile/UserProfileReducer';
import * as userRegistration from '../../Views/User/Profile/UserRegistrationModule';
import * as passwordChange from '../../Views/User/Password/UserPasswordChangeStoreModule';
import * as passwordReset from '../../Views/User/Password/UserPasswordResetStoreModule';
import * as userDatasetList from '../../Views/UserDatasets/List/UserDatasetListStoreModule';

export default {
  globalData,
  downloadForm,
  userProfile,
  userRegistration,
  passwordChange,
  passwordReset,
  userDatasetList,
};