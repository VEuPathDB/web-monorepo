import { PasswordFormUpdateAction, PasswordFormSubmissionStatusAction } from 'wdk-client/Views/User/UserActionCreators';

export const key = 'passwordChange';

type Action = PasswordFormUpdateAction | PasswordFormSubmissionStatusAction;

export type State = {
  formStatus: 'new' | 'modified' | 'pending' | 'success' | 'error';
  errorMessage?: string;
  passwordForm: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }
}

const defaultState: State = {
  passwordForm: getEmptyForm(),
  formStatus: 'new', // Values: [ 'new', 'modified', 'pending', 'success', 'error' ]
  errorMessage: undefined
};

export function reduce(state: State = defaultState, action: Action): State {
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

function getEmptyForm() {
  return {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
}
