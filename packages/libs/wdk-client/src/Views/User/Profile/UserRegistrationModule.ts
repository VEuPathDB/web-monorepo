import { reduce as reduceProfile, State as UserProfileState, Action, UserProfileFormData } from './UserProfileReducer';
import { ClearRegistrationFormAction } from '../UserActionCreators';
import { UserPreferences } from '../../../Utils/WdkUser';

export const key = 'userRegistration';

// Re-export state to follow convention
export type State = UserProfileState;

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

export function reduce(state: State, action: Action): State {
  state = reduceProfile(state, action);
  const userFormData = reduceFormData(state.userFormData, action);
  return userFormData === state.userFormData
    ? state
    : { ...state, userFormData }
}

function reduceFormData(state: UserProfileFormData = emptyUserFormData, action: RegistrationAction): UserProfileFormData {
  switch(action.type) {
    case 'user/clear-registration-form':
        return emptyUserFormData;
    default:
        return state;
  }
}