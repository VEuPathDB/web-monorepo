import { Location } from 'history';
import {StaticDataAction, AllDataAction, StaticData} from '../../../Core/ActionCreators/StaticDataActionCreators';
import { UserUpdateAction, PreferenceUpdateAction, PreferencesUpdateAction, ShowLoginModalAction, LoginDismissedAction, LoginErrorAction } from '../../../Views/User/UserActionCreators';
import { LocationAction } from '../../../Core/ActionCreators/RouterActionCreators';
import { UserPreferences } from '../../../Utils/WdkUser';

type UserAction = UserUpdateAction | PreferenceUpdateAction | PreferencesUpdateAction;
type LoginAction = ShowLoginModalAction | LoginDismissedAction | LoginErrorAction;
type RouterAction = LocationAction;
type Action = AllDataAction | StaticDataAction | UserAction | RouterAction | LoginAction;

export type GlobalData = Partial<StaticData & {
  siteConfig?: any;
  location: Location;
  loginForm: {
    isOpen: boolean;
    message?: string;
    destination?: string;
  }
}>

const initialState: GlobalData = {
  loginForm: {
    isOpen: false
  }
}
  /**
   * Handles requested static data item loads and passes remaining actions to
   * handleAction(), which will usually be overridden by the subclass
   */
export function reduce(state: GlobalData | undefined = initialState, action: Action): GlobalData {
  switch(action.type) {
    // static data actions
    case 'static/config-loaded':
    case 'static/categories-loaded':
    case 'static/questions-loaded':
    case 'static/recordClasses-loaded':
    case 'static/user-loaded':
    case 'static/preferences-loaded':
    case 'static/all-data-loaded':
    case 'user/user-update':


    // router actions
    case 'router/location-updated':
      return { ...state, ...action.payload, loginForm: { isOpen: false } };


    // user actions
    case 'user/preference-update':
      // incorporate new preference values into existing preference object
      let { global: oldGlobal, project: oldProject } = state.preferences || {} as UserPreferences;
      let { global: newGlobal, project: newProject } = action.payload;
      let combinedGlobal = newGlobal == null ? oldGlobal : Object.assign({}, oldGlobal, newGlobal);
      let combinedProject = newProject == null ? oldProject : Object.assign({}, oldProject, newProject);
      let combinedPrefs = { global: combinedGlobal, project: combinedProject };
      // treat preference object as if it has just been loaded (with new values present)
      return { ...state, preferences: combinedPrefs };

    case 'user/preferences-update':
      // replace existing preference object with new preference values
      let replacementPrefs = { ...action.payload };
      // treat preference object as if it has just been loaded (with new values present)
      return { ...state, preferences: replacementPrefs };


    // loginForm actions
    case 'user/show-login-modal':
      return {
        ...state,
        loginForm: {
          ...state.loginForm,
          isOpen: true,
          destination: action.payload.destination
        }
      };

    case 'user/login-dismissed':
      return {
        ...state,
        loginForm: {
          isOpen: false
        }
      };

    case 'user/login-error':
      return {
        ...state,
        loginForm: {
          ...state.loginForm,
          isOpen: Boolean(state.loginForm && state.loginForm.isOpen),
          message: action.payload.message
        }
      };

    default:
      return state;
  }
}
