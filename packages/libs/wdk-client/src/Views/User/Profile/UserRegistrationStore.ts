import { reduce, State as UserProfileState, Action, UserProfileFormData } from './UserProfileReducer';
import { ClearRegistrationFormAction } from '../UserActionCreators';
import { UserPreferences } from '../../../Utils/WdkUser';
import WdkStore, { BaseState } from '../../../Core/State/Stores/WdkStore';

// Re-export state to follow convention
export type State = BaseState & UserProfileState;

type RegistrationAction = Action | ClearRegistrationFormAction;

const emptyUserFormData: UserProfileFormData = {
  id: 0,
  email: '',
  isGuest: true,
  properties: { },
  confirmEmail: '',
  preferences: {
    global: {},
    project: {}
  } as UserPreferences
};

export default class UserRegistrationStore extends WdkStore<State> {

  // defines the structure of this store's data
  getInitialState(): State {
    return {
      ...super.getInitialState(),
      userFormData: emptyUserFormData,
      formStatus: "new",  // Values: [ 'new', 'modified', 'pending', 'success', 'error' ]
      errorMessage: undefined
    };
  }

  handleAction(state: State, action: RegistrationAction): State {
    switch(action.type) {
      case 'user/clear-registration-form':
          let newState = Object.assign({}, state, { userFormData: emptyUserFormData });
          return newState;
      default:
          return state; //super.handleFormUpdate(state, action);
    }
  }
}
