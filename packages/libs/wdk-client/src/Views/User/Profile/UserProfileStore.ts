import WdkStore, { BaseState } from '../../../Core/State/Stores/WdkStore';
import {
  ProfileFormUpdateAction,
  ProfileFormSubmissionStatusAction
} from '../../../Core/ActionCreators/UserActionCreators';
import { User, UserPreferences } from "../../../Utils/WdkUser";

export type Action = ProfileFormUpdateAction | ProfileFormSubmissionStatusAction;

export type UserProfileFormData = User & {
  confirmEmail?: string;
  preferences?: UserPreferences;
};

export type State = BaseState & {
  userFormData?: UserProfileFormData;
  formStatus: 'new' | 'modified' | 'pending' | 'success' | 'error';
  errorMessage?: string;
}

export default class UserProfileStore extends WdkStore<State> {

  // defines the structure of this store's data
  getInitialState(): State {
    return {
      ...super.getInitialState(),
      userFormData: undefined, // will be initialized when user is initialized
      formStatus: "new",  // Values: [ 'new', 'modified', 'pending', 'success', 'error' ]
      errorMessage: undefined
    };
  }

  handleAction(state: State, action: Action): State {
    const prevUser = this.getState().globalData.user;
    const nextUser = state.globalData.user;
    const prevPrefs = this.getState().globalData.preferences;
    const nextPrefs = state.globalData.preferences;

    // Special case since this store is maintaining an unsaved, edited version
    // of the user and her preferences, not the 'gold copy' saved version.  Need
    // to override handling of user and preference load actions to update the
    // unsaved copies to be clones of the 'gold copy' versions.
    if (this.globalDataStore.hasChanged()) {
      if (nextUser != null && prevUser != nextUser) {
        return this.replaceUserFormData(state, { ...state.userFormData, ...nextUser, confirmEmail: nextUser.email } as UserProfileFormData);
      }
      if (prevPrefs != nextPrefs) {
        return this.replaceUserFormData(state, { ...state.userFormData, ...prevUser, preferences: nextPrefs } as UserProfileFormData);
      }
    }

    return this.handleFormUpdate(state, action);
  }

  replaceUserFormData(state: State, newUserFormData: UserProfileFormData): State {
    return {
      ...state,
      userFormData: newUserFormData,
      formStatus: "new",
      errorMessage: undefined
    };
  }

  handleFormUpdate(state: State, action: Action): State {
    switch (action.type) {
      // form value has been updated; now different than 'saved' user
      case 'user/profile-form-update':
        return {
          ...state,
          userFormData: action.payload.user,
          formStatus: "modified"
        };
      case 'user/profile-form-submission-status':
        return {
          ...state,
          formStatus: action.payload.formStatus,
          errorMessage: action.payload.errorMessage
        };
      default:
        return state;
    }
  }
}
