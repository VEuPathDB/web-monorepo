import {
  ProfileFormUpdateAction,
  ProfileFormSubmissionStatusAction,
} from '../Actions/UserActions';
import { User, UserPreferences } from '../Utils/WdkUser';

export const key = 'userProfile';

export type Action =
  | ProfileFormUpdateAction
  | ProfileFormSubmissionStatusAction;

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
    default:
      return state;
  }
}
