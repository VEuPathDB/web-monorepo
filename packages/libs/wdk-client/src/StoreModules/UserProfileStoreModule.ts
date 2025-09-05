import {
  ProfileFormUpdateAction,
  ProfileFormSubmissionStatusAction,
  ProfileFormResetAction,
} from '../Actions/UserActions';
import { User, UserPreferences } from '../Utils/WdkUser';

export const key = 'userProfile';

export type Action =
  | ProfileFormUpdateAction
  | ProfileFormSubmissionStatusAction
  | ProfileFormResetAction;

export type UserProfileFormData = Partial<
  User & {
    confirmEmail: string;
    preferences: UserPreferences;
  }
>;

export type State = {
  userFormData?: UserProfileFormData;
  formStatus: 'new' | 'modified' | 'pending' | 'success' | 'error';
  previousUserFormData?: UserProfileFormData;
  errorMessage?: string;
};

const defaultState: State = {
  errorMessage: undefined,
  formStatus: 'new',
  userFormData: undefined,
  previousUserFormData: undefined,
};

export function reduce(state: State = defaultState, action: Action): State {
  switch (action.type) {
    // form value has been updated; now different than 'saved' user
    case 'user/profile-form-update':
      return {
        ...state,
        userFormData: action.payload.userFormContent,
        formStatus: 'modified',
      };
    case 'user/profile-form-submission-status':
      return {
        ...state,
        formStatus: action.payload.formStatus,
        previousUserFormData: action.payload.formData,
        errorMessage: action.payload.errorMessage,
      };
    // reset form to initial state without backend call
    case 'user/profile-form-reset':
      return {
        ...state,
        userFormData: action.payload.userFormContent,
        formStatus: 'new',
        errorMessage: undefined,
      };
    default:
      return state;
  }
}
