import UserProfileStore, { State, Action, UserProfileFormData } from './UserProfileStore';
import { ClearRegistrationFormAction } from '../../../Core/ActionCreators/UserActionCreators';
import { UserPreferences } from '../../../Utils/WdkUser';

// Re-export state to follow convention
export { State };

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

export default class UserRegistrationStore extends UserProfileStore {

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
          return super.handleFormUpdate(state, action);
    }
  }
}
