import {
  ResetPasswordUpdateEmailAction,
  ResetPasswordSubmissionStatusAction
} from '../UserActionCreators';

// defines the structure of this store's data
export type State = {
  emailText: string, // current value typed in box
  message?: string   // message to user if submission fails
};

// defines actions this store can receive
type Action = ResetPasswordUpdateEmailAction|ResetPasswordSubmissionStatusAction;

const initialValues: State = {
  emailText: '',
  message: undefined
};

export function reduce(state: State = initialValues, action: Action): State {
  switch (action.type) {
    case 'user/reset-password-email-update':
      return {
        ...state,
        emailText: action.payload
      };
    case 'user/reset-password-submission-status':
      let { success, message } = action.payload;
      return {
        ...state,
        ...(success ? initialValues : { message })
      };
    default:
      return state;
  }
}