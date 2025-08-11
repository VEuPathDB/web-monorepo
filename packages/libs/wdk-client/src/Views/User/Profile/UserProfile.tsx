import React from 'react';
import { wrappable } from '../../../Utils/ComponentUtils';
import UserFormContainer, {
  UserFormContainerProps,
} from '../../../Views/User/UserFormContainer';
import '../../../Views/User/Profile/UserProfile.scss';
import { UserProfileFormData } from '../../../StoreModules/UserProfileStoreModule';
import { User } from '../../../Utils/WdkUser';
import { ServiceConfig } from '../../../Service/ServiceBase';

type UserProfileProps = Omit<
  UserFormContainerProps,
  | 'shouldHideForm'
  | 'hiddenFormMessage'
  | 'titleText'
  | 'submitButtonText'
  | 'onSubmit'
> & {
  globalData: { user?: User; config?: ServiceConfig };
  userEvents: {
    submitProfileForm: (userData: UserProfileFormData) => void;
    updateProfileForm: (newState: UserProfileFormData) => void;
    resetProfileForm?: (formData: UserProfileFormData) => void;
  };
  singleFormMode?: boolean;
};

/**
 * React component for the user profile/account form
 */
const UserProfile: React.FC<UserProfileProps> = (props) => (
  <UserFormContainer
    shouldHideForm={!!props.globalData.user?.isGuest}
    hiddenFormMessage="You must first log on to read and alter your account information."
    titleText={`Account: ${props.globalData.user?.properties.firstName} ${props.globalData.user?.properties.lastName}`}
    submitButtonText="Save"
    onSubmit={props.userEvents.submitProfileForm}
    singleFormMode={props.singleFormMode}
    {...props}
  />
);

export default wrappable(UserProfile);
