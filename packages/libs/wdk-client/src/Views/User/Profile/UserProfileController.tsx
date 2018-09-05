import * as React from 'react';
import { submitProfileForm, updateProfileForm } from '../../../Core/ActionCreators/UserActionCreators';
import AbstractPageController from '../../../Core/Controllers/AbstractPageController';
import { wrappable } from '../../../Utils/ComponentUtils';
import UserProfile from './UserProfile';
import UserProfileStore, { State } from './UserProfileStore';

const ActionCreators = { updateProfileForm, submitProfileForm };

class UserProfileController extends AbstractPageController<State, UserProfileStore, typeof ActionCreators> {

  getStoreClass() {
    return UserProfileStore;
  }

  getStateFromStore() {
    return this.store.getState();
  }

  getActionCreators() {
    return { updateProfileForm, submitProfileForm };
  }

  isRenderDataLoaded() {
    return (this.state.userFormData != null &&
            this.state.userFormData.preferences != null &&
            this.state.globalData.config != null);
  }

  getTitle() {
    return "User Account";
  }

  renderView() {
    return ( <UserProfile {...this.state} userEvents={this.eventHandlers}/> );
  }
}

export default wrappable(UserProfileController);
