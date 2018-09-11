import * as React from 'react';
import { wrappable } from '../../../Utils/ComponentUtils';
import AbstractPageController from '../../../Core/Controllers/AbstractPageController';
import UserRegistration from '../../../Views/User/Profile/UserRegistration';
import { updateProfileForm, submitRegistrationForm, conditionallyTransition } from '../UserActionCreators';
import UserRegistrationStore, { State } from "../../../Views/User/Profile/UserRegistrationStore";

const ActionCreators = { updateProfileForm, submitRegistrationForm, conditionallyTransition };

class UserRegistrationController extends AbstractPageController<State, UserRegistrationStore, typeof ActionCreators> {

  getStoreClass() {
    return UserRegistrationStore;
  }

  getStateFromStore() {
    return this.store.getState();
  }

  getActionCreators() {
    return { updateProfileForm, submitRegistrationForm, conditionallyTransition };
  }

  isRenderDataLoaded() {
    return (this.state.userFormData != null &&
            this.state.userFormData.preferences != null &&
            this.state.globalData.config != null &&
            // show Loading if user is guest
            //   (will transition to Profile page in loadData() if non-guest)
            this.state.globalData.user != null &&
            this.state.globalData.user.isGuest);
  }

  getTitle() {
    return "Register";
  }

  renderView() {
    return ( <UserRegistration {...this.state} userEvents={this.eventHandlers}/> );
  }

  loadData() {
    this.eventHandlers.conditionallyTransition(user => !user.isGuest, '/user/profile');
  }
}

export default wrappable(UserRegistrationController);
