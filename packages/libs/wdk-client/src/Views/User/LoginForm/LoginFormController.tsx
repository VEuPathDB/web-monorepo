import { get } from 'lodash';
import * as React from 'react';
import { hideLoginForm, submitLoginForm } from '../../../Core/ActionCreators/UserActionCreators';
import WdkViewController from '../../../Core/Controllers/WdkViewController';
import LoginForm from './LoginForm';

export default class LoginFormController extends WdkViewController {

  cancel = () => {
    this.dispatchAction(hideLoginForm());
  }

  submit = (email: string, password: string) => {
    const destination = get(this.state.globalData, 'loginForm.destination', window.location.href);
    this.dispatchAction(submitLoginForm( email, password, destination));
  }

  renderView() {
    const { loginForm = { isOpen: false, message: undefined } } = this.state.globalData;
    return (
      <LoginForm
        open={loginForm.isOpen}
        message={loginForm.message}
        passwordResetPath="/user/forgot-password"
        registerPath="/user/registration"
        onCancel={this.cancel}
        onSubmit={this.submit}
      />
    );
  }
}
