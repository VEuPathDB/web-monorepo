import * as React from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import PageController from 'wdk-client/Core/Controllers/PageController';
import UserRegistration from 'wdk-client/Views/User/Profile/UserRegistration';
import { profileFormUpdate, submitRegistrationForm, conditionallyTransition } from 'wdk-client/Actions/UserActions';
import { RootState } from 'wdk-client/Core/State/Types';
import { connect } from 'react-redux';

const actionCreators = {
  updateProfileForm: profileFormUpdate,
  submitRegistrationForm,
  conditionallyTransition
};

type Props = {
  globalData: RootState['globalData'];
  userEvents: typeof actionCreators;
} & RootState['userProfile']

class UserRegistrationController extends PageController<Props> {

  getActionCreators() {
    return actionCreators;
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
actionCreators,
(stateProps, dispatchProps) => ({ ...stateProps, userEvents: dispatchProps }))

export default enhance(wrappable(UserRegistrationController));
