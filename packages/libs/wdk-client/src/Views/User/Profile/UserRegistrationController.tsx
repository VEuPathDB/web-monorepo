import * as React from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import PageController from 'wdk-client/Core/Controllers/PageController';
import UserRegistration from 'wdk-client/Views/User/Profile/UserRegistration';
import { updateProfileForm, submitRegistrationForm, conditionallyTransition } from 'wdk-client/Views/User/UserActionCreators';
import { RootState } from 'wdk-client/Core/State/Types';
import { connect } from 'react-redux';

const ActionCreators = { updateProfileForm, submitRegistrationForm, conditionallyTransition };

type Props = {
  globalData: RootState['globalData'];
  userProfile: RootState['userProfile'];
  userEvents: typeof ActionCreators;
}

class UserRegistrationController extends PageController<Props> {

  getActionCreators() {
    return { updateProfileForm, submitRegistrationForm, conditionallyTransition };
  }

  isRenderDataLoaded() {
    return (this.props.globalData.preferences != null &&
            this.props.globalData.config != null &&
            // show Loading if user is guest
            //   (will transition to Profile page in loadData() if non-guest)
            this.props.globalData.user != null &&
            this.props.globalData.user.isGuest);
  }

  getTitle() {
    return "Register";
  }

  renderView() {
    return ( <UserRegistration {...this.props}/> );
  }

  loadData() {
    this.props.userEvents.conditionallyTransition(user => !user.isGuest, '/user/profile');
  }
}

const enhance = connect((state: RootState) => ({
  globalData: state.globalData,
  ...state.userRegistration,
}),
ActionCreators,
(stateProps, dispatchProps) => ({ ...stateProps, userEvents: dispatchProps }))

export default enhance(wrappable(UserRegistrationController));
