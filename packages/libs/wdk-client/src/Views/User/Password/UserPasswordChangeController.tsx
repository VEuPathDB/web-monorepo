import * as React from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import PageController from 'wdk-client/Core/Controllers/PageController';
import ChangePasswordForm from 'wdk-client/Views/User/Password/ChangePasswordForm';
import { updateChangePasswordForm, savePassword } from 'wdk-client/Views/User/UserActionCreators';
import { RootState } from 'wdk-client/Core/State/Types';
import { connect } from 'react-redux';

const ActionCreators = { updateChangePasswordForm, savePassword };

type Props = RootState['passwordChange'] & Pick<RootState['globalData'], 'user'> & typeof ActionCreators;

class UserPasswordChangeController extends PageController<Props> {

  getActionCreators() {
    return ActionCreators;
  }

  isRenderDataLoaded() {
    return (this.props.user != null);
  }

  getTitle() {
    return "Change Password";
  }

  renderView() {
    return ( <ChangePasswordForm {...this.props}/> );
  }
}

const enhance = connect(
  (state: RootState) => ({
    ...state.passwordChange,
    user: state.globalData.user
  }),
  ActionCreators,
  (stateProps, dispatchProps) => ({ ...stateProps, userEvents: dispatchProps })
)

export default enhance(wrappable(UserPasswordChangeController));
