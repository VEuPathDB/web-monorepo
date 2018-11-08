import { ActionThunk } from 'wdk-client/Utils/ActionCreatorUtils';
import { CategoryOntology } from 'wdk-client/Utils/CategoryUtils';
import { Question, RecordClass } from 'wdk-client/Utils/WdkModel';
import { ServiceConfig } from 'wdk-client/Utils/WdkService';
import { User, UserPreferences } from 'wdk-client/Utils/WdkUser';

//==============================================================================

export const CONFIG_LOADED = "static/config-loaded";

export interface ConfigLoadedAction {
  type: typeof CONFIG_LOADED;
  payload: {
    config: ServiceConfig;
  }
}

export function configLoaded(config: ServiceConfig): ConfigLoadedAction {
  return {
    type: CONFIG_LOADED,
    payload: {
      config
    }
  }
}

//==============================================================================

export const ONTOLOGY_LOADED = "static/ontology-loaded";

export interface OntologyLoadedAction {
  type: typeof ONTOLOGY_LOADED;
  payload: {
    ontology: CategoryOntology;
  };
}

export function ontologyLoaded(ontology: CategoryOntology): OntologyLoadedAction {
  return {
    type: ONTOLOGY_LOADED,
    payload: {
      ontology
    }
  }
}

//==============================================================================

export const QUESTIONS_LOADED = "satic/questions-loaded";

export interface QuestionsLoadedAction {
  type: typeof QUESTIONS_LOADED;
  payload: {
    questions: Question[];
  };
}

export function questionsLoaded(questions: Question[]): QuestionsLoadedAction {
  return {
    type: QUESTIONS_LOADED,
    payload: {
      questions
    }
  };
}

//==============================================================================

export const RECORDCLASSES_LOADED = "static/recordClasses-loaded";

export interface RecordClassesLoadedAction {
  type: typeof RECORDCLASSES_LOADED;
  payload: {
    recordClasses: RecordClass[];
  };
}

export function recordClassesLoaded(recordClasses: RecordClass[]): RecordClassesLoadedAction {
  return {
    type: RECORDCLASSES_LOADED,
    payload: {
      recordClasses
    }
  };
}

//==============================================================================

export const USER_LOADED = "static/user-loaded";

export interface UserLoadedAction {
  type: typeof USER_LOADED;
  payload: {
    user: User;
  };
}

export function userLoaded(user: User): UserLoadedAction {
  return {
    type: USER_LOADED,
    payload: {
      user
    }
  }
}

//==============================================================================

export const PREFERENCES_LOADED = "static/preferences-loaded";

export interface PreferencesLoadedAction {
  type: typeof PREFERENCES_LOADED;
  payload: {
    preferences: UserPreferences;
  };
}

export function preferencesLoaded(preferences: UserPreferences): PreferencesLoadedAction {
  return {
    type: PREFERENCES_LOADED,
    payload: {
      preferences
    }
  };
}

//==============================================================================

export const ALL_DATA_LOADED = 'static/all-data-loaded';

// action triggered when all static data loaded
export type AllDataLoadedAction = {
  type: typeof ALL_DATA_LOADED;
  payload: undefined;
}

export function allDataLoaded(): AllDataLoadedAction {
  return {
    type: ALL_DATA_LOADED,
    payload: undefined
  };
}

//==============================================================================

export const LOAD_ERROR = 'static/load-error';

// action triggered if static data could not be loaded
export type LoadErrorAction = {
  type: typeof LOAD_ERROR;
  payload: { error: Error }
}

export function loadError(error: Error): LoadErrorAction {
  return {
    type: LOAD_ERROR,
    payload: {
      error
    }
  };
}

//==============================================================================

export type Action =
  | ConfigLoadedAction
  | OntologyLoadedAction
  | QuestionsLoadedAction
  | RecordClassesLoadedAction
  | UserLoadedAction
  | PreferencesLoadedAction
  | AllDataLoadedAction
  | LoadErrorAction


export function loadAllStaticData(): ActionThunk<Action> {
  return async function run({ wdkService }) {
    return Promise.all([
      wdkService.getConfig().then(configLoaded),
      wdkService.getOntology().then(ontologyLoaded),
      wdkService.getQuestions().then(questionsLoaded),
      wdkService.getRecordClasses().then(recordClassesLoaded),
      wdkService.getCurrentUser().then(userLoaded),
      wdkService.getCurrentUserPreferences().then(preferencesLoaded),
      allDataLoaded()
    ])
    .catch(loadError);
  }
}
