import WdkStore, { BaseState } from '../../../Core/State/Stores/WdkStore';
import {
  ResetPasswordUpdateEmailAction,
  ResetPasswordSubmissionStatusAction
} from '../UserActionCreators';

// defines the structure of this store's data
export type State = BaseState & {
  emailText: string, // current value typed in box
  message?: string   // message to user if submission fails
};

// defines actions this store can receive
type Action = ResetPasswordUpdateEmailAction|ResetPasswordSubmissionStatusAction;

const initialValues = {
  emailText: '',
  message: undefined
};

export default class UserPasswordResetStore extends WdkStore<State> {

  getInitialState(): State {
    return {
      ...super.getInitialState(),
      ...initialValues
    };
  }

  handleAction(state: State, action: Action): State {
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
}
