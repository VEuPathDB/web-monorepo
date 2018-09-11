import * as globalData from './StoreModules/GlobalData';
import * as downloadForm from '../../Views/ReporterForm/DownloadFormStoreModule';
import * as userProfile from '../../Views/User/Profile/UserProfileReducer';
import * as userRegistration from '../../Views/User/Profile/UserRegistrationModule';
import * as passwordChange from '../../Views/User/Password/UserPasswordChangeStoreModule';

export default {
  globalData,
  downloadForm,
  userProfile,
  userRegistration,
  passwordChange,
};