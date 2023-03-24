import { Action } from '../Actions';
import {
  PASSWORD_FORM_UPDATE,
  PASSWORD_FORM_SUBMISSION_STATUS,
} from '../Actions/UserActions';

export const key = 'passwordChange';

export type State = {
  formStatus: 'new' | 'modified' | 'pending' | 'success' | 'error';
  errorMessage?: string;
  passwordForm: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
};

const defaultState: State = {
  passwordForm: getEmptyForm(),
  formStatus: 'new', // Values: [ 'new', 'modified', 'pending', 'success', 'error' ]
  errorMessage: undefined,
};

export function reduce(state: State = defaultState, action: Action): State {
  switch (action.type) {
    case PASSWORD_FORM_UPDATE:
      return {
        ...state,
        passwordForm: action.payload,
        formStatus: 'modified',
      };
    case PASSWORD_FORM_SUBMISSION_STATUS:
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
    confirmPassword: '',
  };
}
