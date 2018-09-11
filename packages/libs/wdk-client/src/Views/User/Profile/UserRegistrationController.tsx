import * as React from 'react';
import { wrappable } from '../../../Utils/ComponentUtils';
import PageController from '../../../Core/Controllers/PageController';
import UserRegistration from './UserRegistration';
import { updateProfileForm, submitRegistrationForm, conditionallyTransition } from '../UserActionCreators';
import { RootState } from '../../../Core/State/Types';
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

export default wrappable(enhance(UserRegistrationController));
