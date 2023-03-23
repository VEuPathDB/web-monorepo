import React from 'react';
import { wrappable } from '../../../Utils/ComponentUtils';
import UserFormContainer, {
  UserFormContainerPropTypes,
} from '../../../Views/User/UserFormContainer';
import '../../../Views/User/Profile/UserProfile.css';

/**
 * React component for the user profile/account form
 * @type {*|Function}
 */
let UserProfile = (props) => (
  <UserFormContainer
    {...props}
    shouldHideForm={props.globalData.user.isGuest}
    hiddenFormMessage="You must first log on to read and alter your account information."
    titleText="My Account"
    showChangePasswordBox={true}
    submitButtonText="Save"
    onSubmit={props.userEvents.submitProfileForm}
  />
);

UserProfile.propTypes = UserFormContainerPropTypes;

export default wrappable(UserProfile);
