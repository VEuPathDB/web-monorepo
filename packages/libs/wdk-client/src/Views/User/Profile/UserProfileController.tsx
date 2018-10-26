import * as React from 'react';
import { connect } from 'react-redux';
import { submitProfileForm, updateProfileForm } from 'wdk-client/Views/User/UserActionCreators';
import PageController from 'wdk-client/Core/Controllers/PageController';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import UserProfile from 'wdk-client/Views/User/Profile/UserProfile';
import { RootState } from 'wdk-client/Core/State/Types';

const ActionCreators = { updateProfileForm, submitProfileForm };

type Props = {
  globalData: RootState['globalData'];
  userProfile: RootState['userProfile'];
  userEvents: typeof ActionCreators;
}

class UserProfileController extends PageController<Props> {

  isRenderDataLoaded() {
    return ( this.props.globalData.user != null &&
            this.props.globalData.preferences != null &&
            this.props.globalData.config != null);
  }

  getTitle() {
    return "User Account";
  }

  renderView() {
    return ( <UserProfile {...this.props} /> );
  }
}

const enhance = connect((state: RootState) => ({
  globalData: state.globalData,
  ...state.userProfile,
  userFormData: {
    ...state.globalData.user,
    confirmEmail: state.globalData.user && state.globalData.user.email,
    preferences: state.globalData.preferences,
    ...state.userProfile.userFormData
  }
}),
ActionCreators,
(stateProps, dispatchProps) => ({ ...stateProps, userEvents: dispatchProps }))

export default enhance(wrappable(UserProfileController));
