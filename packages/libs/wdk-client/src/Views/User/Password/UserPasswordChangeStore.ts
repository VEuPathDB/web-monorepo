import WdkStore, { BaseState } from '../../../Core/State/Stores/WdkStore';
import { PasswordFormUpdateAction, PasswordFormSubmissionStatusAction } from '../UserActionCreators';

type Action = PasswordFormUpdateAction | PasswordFormSubmissionStatusAction;

export type State = BaseState & {
  formStatus: 'new' | 'modified' | 'pending' | 'success' | 'error';
  errorMessage?: string;
  passwordForm: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }
}
export default class UserPasswordChangeStore extends WdkStore<State> {

  // defines the structure of this store's data
  getInitialState(): State {
    return {
      ...super.getInitialState(),
      passwordForm: getEmptyForm(),
      formStatus: 'new', // Values: [ 'new', 'modified', 'pending', 'success', 'error' ]
      errorMessage: undefined
    };
  }

  handleAction(state: State, action: Action): State {
    switch (action.type) {
      case 'user/password-form-update':
        return {
          ...state,
          passwordForm: action.payload,
          formStatus: 'modified'
        };
      case 'user/password-form-submission-status':
        return {
          ...state,
          // in all status update cases, we should clear passwords
          passwordForm: getEmptyForm(),
          formStatus: action.payload.formStatus,
          errorMessage: action.payload.errorMessage,
        };
      default:
        return state;
    }
  }
}

function getEmptyForm() {
  return {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
}
