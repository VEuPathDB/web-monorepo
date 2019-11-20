import { Location } from 'history';
import { Action } from 'wdk-client/Actions';
import { updateLocation } from 'wdk-client/Actions/RouterActions';
import {
  questionsLoaded,
  configLoaded,
  ontologyLoaded,
  recordClassesLoaded,
  userLoaded,
  preferencesLoaded,
  allDataLoaded
} from 'wdk-client/Actions/StaticDataActions';
import {
  USER_UPDATE,
  PREFERENCE_UPDATE,
  PREFERENCES_UPDATE
} from 'wdk-client/Actions/UserActions';
import { 
  showLoginModal,
  hideLoginModal,
  loginError
} from 'wdk-client/Actions/UserSessionActions';
import { CategoryOntology } from 'wdk-client/Utils/CategoryUtils';
import { Question, RecordClass } from 'wdk-client/Utils/WdkModel';
import { UserPreferences, User } from 'wdk-client/Utils/WdkUser';
import { ServiceConfig } from 'wdk-client/Service/ServiceBase';

export const key = 'globalData';

export type GlobalData = Partial<{
  config: ServiceConfig;
  ontology: CategoryOntology;
  questions: Question[];
  recordClasses: RecordClass[];
  user: User;
  preferences: UserPreferences;
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
    case configLoaded.type:
    case ontologyLoaded.type:
    case questionsLoaded.type:
    case recordClassesLoaded.type:
    case userLoaded.type:
    case preferencesLoaded.type:
    case allDataLoaded.type:
    case USER_UPDATE:
      return { ...state, ...action.payload };

    // router actions
    case updateLocation.type:
      return { ...state, ...action.payload, loginForm: { isOpen: false } };

    // user actions
    case PREFERENCE_UPDATE:
      // incorporate new preference values into existing preference object
      let { global: oldGlobal, project: oldProject } = state.preferences || {} as UserPreferences;
      let { global: newGlobal, project: newProject } = action.payload;
      let combinedGlobal = newGlobal == null ? oldGlobal : Object.assign({}, oldGlobal, newGlobal);
      let combinedProject = newProject == null ? oldProject : Object.assign({}, oldProject, newProject);
      let combinedPrefs = { global: combinedGlobal, project: combinedProject };
      // treat preference object as if it has just been loaded (with new values present)
      return { ...state, preferences: combinedPrefs };

    case PREFERENCES_UPDATE:
      // replace existing preference object with new preference values
      let replacementPrefs = { ...action.payload };
      // treat preference object as if it has just been loaded (with new values present)
      return { ...state, preferences: replacementPrefs };


    // loginForm actions
    case showLoginModal.type:
      return {
        ...state,
        loginForm: {
          ...state.loginForm,
          isOpen: true,
          destination: action.payload.destination
        }
      };

    case hideLoginModal.type:
      return {
        ...state,
        loginForm: {
          isOpen: false
        }
      };

    case loginError.type:
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
