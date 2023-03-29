import * as React from 'react';
import { wrappable } from '../Utils/ComponentUtils';
import PageController from '../Core/Controllers/PageController';
import UserPasswordReset from '../Views/User/Password/UserPasswordReset';
import {
  resetPasswordUpdateEmail,
  submitPasswordReset,
  conditionallyTransition,
} from '../Actions/UserActions';
import { RootState } from '../Core/State/Types';
import { connect } from 'react-redux';

const actionCreators = {
  updatePasswordResetEmail: resetPasswordUpdateEmail,
  submitPasswordReset,
  conditionallyTransition,
};

type Props = {
  stateProps: RootState['passwordReset'] &
    Pick<RootState['globalData'], 'user'>;
  dispatchProps: typeof actionCreators;
};

class UserPasswordResetController extends PageController<Props> {
  getActionCreators() {
    return actionCreators;
  }

  getTitle() {
    return 'Reset Password';
  }

  isRenderDataLoaded() {
    // show Loading if no user loaded yet, or if user is guest
    //   (will transition to Profile page in loadData() if non-guest)
    return (
      this.props.stateProps.user != null && this.props.stateProps.user.isGuest
    );
  }

  renderView() {
    return (
      <UserPasswordReset
        {...this.props.stateProps}
        {...this.props.dispatchProps}
      />
    );
  }

  loadData() {
    this.props.dispatchProps.conditionallyTransition(
      (user) => !user.isGuest,
      '/user/profile'
    );
  }
}

const enhance = connect<
  Props['stateProps'],
  Props['dispatchProps'],
  {},
  Props,
  RootState
>(
  (state: RootState) => ({
    ...state.passwordReset,
    user: state.globalData.user,
  }),
  actionCreators,
  (stateProps, dispatchProps) => ({ stateProps, dispatchProps })
);

export default enhance(wrappable(UserPasswordResetController));
