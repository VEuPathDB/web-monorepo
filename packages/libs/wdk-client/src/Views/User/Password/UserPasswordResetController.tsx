import * as React from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import PageController from 'wdk-client/Core/Controllers/PageController';
import UserPasswordReset from 'wdk-client/Views/User/Password/UserPasswordReset';
import {
  resetPasswordUpdateEmail,
  submitPasswordReset,
  conditionallyTransition
} from 'wdk-client/Actions/UserActions';
import { RootState } from 'wdk-client/Core/State/Types';
import { connect } from 'react-redux';

const actionCreators = {
  updatePasswordResetEmail: resetPasswordUpdateEmail,
  submitPasswordReset,
  conditionallyTransition
}

type Props = typeof actionCreators & RootState['passwordReset'] & Pick<RootState['globalData'], 'user'>;

class UserPasswordResetController extends PageController<Props> {

  getActionCreators() {
    return actionCreators;
  }

  getTitle() {
    return "Reset Password";
  }

  isRenderDataLoaded() {
    // show Loading if no user loaded yet, or if user is guest
    //   (will transition to Profile page in loadData() if non-guest)
    return (this.props.user != null && this.props.user.isGuest);
  }

  renderView() {
    return ( <UserPasswordReset {...this.props} /> );
  }

  loadData() {
    this.props.conditionallyTransition(user => !user.isGuest, '/user/profile');
  }
}

const enhance = connect(
  (state: RootState) => ({ ...state.passwordReset, user: state.globalData.user }),
  actionCreators
)

export default enhance(wrappable(UserPasswordResetController));
