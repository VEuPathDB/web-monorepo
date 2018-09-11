import * as React from 'react';
import { connect } from 'react-redux';
import { submitProfileForm, updateProfileForm } from '../UserActionCreators';
import PageController from '../../../Core/Controllers/PageController';
import { wrappable } from '../../../Utils/ComponentUtils';
import UserProfile from './UserProfile';
import { RootState } from '../../../Core/State/Types';
import { User, UserPreferences } from '../../../Utils/WdkUser';

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

export default wrappable(enhance(UserProfileController));
