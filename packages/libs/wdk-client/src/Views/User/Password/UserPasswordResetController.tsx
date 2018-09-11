import * as React from 'react';
import { wrappable } from '../../../Utils/ComponentUtils';
import PageController from '../../../Core/Controllers/PageController';
import UserPasswordReset from './UserPasswordReset';
import {
  updatePasswordResetEmail,
  submitPasswordReset,
  conditionallyTransition
} from '../UserActionCreators';
import { RootState } from '../../../Core/State/Types';
import { connect } from 'react-redux';

const ActionCreators = {
  updatePasswordResetEmail,
  submitPasswordReset,
  conditionallyTransition
}

type Props = typeof ActionCreators & RootState['passwordReset'] & Pick<RootState['globalData'], 'user'>;

class UserPasswordResetController extends PageController<Props> {

  getActionCreators() {
    return ActionCreators;
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
  ActionCreators
)

export default wrappable(enhance(UserPasswordResetController));
