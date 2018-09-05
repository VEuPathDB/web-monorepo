import * as React from 'react';
import { wrappable } from '../../../Utils/ComponentUtils';
import AbstractPageController from '../../../Core/Controllers/AbstractPageController';
import UserPasswordReset from './UserPasswordReset';
import {
  updatePasswordResetEmail,
  submitPasswordReset,
  conditionallyTransition
} from '../../../Core/ActionCreators/UserActionCreators';
import UserPasswordResetStore, { State } from "./UserPasswordResetStore";

const ActionCreators = {
  updatePasswordResetEmail,
  submitPasswordReset,
  conditionallyTransition
}

class UserPasswordResetController extends AbstractPageController<State, UserPasswordResetStore, typeof ActionCreators> {

  getStoreClass() {
    return UserPasswordResetStore;
  }

  getStateFromStore() {
    return this.store.getState();
  }

  getActionCreators() {
    return ActionCreators;
  }

  getTitle() {
    return "Reset Password";
  }

  isRenderDataLoaded() {
    // show Loading if no user loaded yet, or if user is guest
    //   (will transition to Profile page in loadData() if non-guest)
    return (this.state.globalData.user != null && this.state.globalData.user.isGuest);
  }

  renderView() {
    return ( <UserPasswordReset {...this.state} {...this.eventHandlers} /> );
  }

  loadData() {
    this.eventHandlers.conditionallyTransition(user => !user.isGuest, '/user/profile');
  }
}

export default wrappable(UserPasswordResetController);
