import * as React from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import PageController from 'wdk-client/Core/Controllers/PageController';
import ChangePasswordForm from 'wdk-client/Views/User/Password/ChangePasswordForm';
import { passwordFormUpdate, savePassword } from 'wdk-client/Actions/UserActions';
import { RootState } from 'wdk-client/Core/State/Types';
import { connect } from 'react-redux';

const actionCreators = {
  updateChangePasswordForm: passwordFormUpdate,
  savePassword
};

type StateProps = RootState['passwordChange'] & Pick<RootState['globalData'], 'user'>;
type DispatchProps = typeof actionCreators;
type MergedProps = StateProps & { userEvents: DispatchProps };

class UserPasswordChangeController extends PageController<MergedProps> {

  getActionCreators() {
    return actionCreators;
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

const enhance = connect<StateProps, DispatchProps, {}, MergedProps, RootState>(
  (state: RootState) => ({
    ...state.passwordChange,
    user: state.globalData.user
  }),
  actionCreators,
  (stateProps, dispatchProps) => ({ ...stateProps, userEvents: dispatchProps })
)

export default enhance(wrappable(UserPasswordChangeController));
