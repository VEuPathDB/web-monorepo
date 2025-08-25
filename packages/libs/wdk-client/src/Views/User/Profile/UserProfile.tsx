import React from 'react';
import { wrappable } from '../../../Utils/ComponentUtils';
import UserFormContainer, {
  UserFormContainerProps,
} from '../../../Views/User/UserFormContainer';
import '../../../Views/User/Profile/UserProfile.scss';
import { UserProfileFormData } from '../../../StoreModules/UserProfileStoreModule';
import { User } from '../../../Utils/WdkUser';
import { ServiceConfig } from '../../../Service/ServiceBase';
import CoreUIThemeProvider from '@veupathdb/coreui/lib/components/theming/UIThemeProvider';
import colors, {
  error,
  warning,
  success,
} from '@veupathdb/coreui/lib/definitions/colors';

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
  <CoreUIThemeProvider
    theme={{
      palette: {
        primary: { hue: colors.mutedCyan, level: 600 },
        secondary: { hue: colors.mutedRed, level: 500 },
        error: { hue: error, level: 600 },
        warning: { hue: warning, level: 600 },
        info: { hue: colors.mutedCyan, level: 600 },
        success: { hue: success, level: 600 },
      },
    }}
  >
    <UserFormContainer
      shouldHideForm={!!props.globalData.user?.isGuest}
      hiddenFormMessage="You must first log on to read and alter your account information."
      titleText={`Account: ${props.globalData.user?.properties.firstName} ${props.globalData.user?.properties.lastName}`}
      submitButtonText="Save"
      onSubmit={props.userEvents.submitProfileForm}
      singleFormMode={props.singleFormMode}
      {...props}
    />
  </CoreUIThemeProvider>
);

export default wrappable(UserProfile);
