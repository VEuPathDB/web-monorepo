import { ActionThunk } from '../../Utils/ActionCreatorUtils';
import { CategoryOntology } from '../../Utils/CategoryUtils';
import { broadcast } from '../../Utils/StaticDataUtils';
import { Question, RecordClass } from '../../Utils/WdkModel';
import WdkService, { ServiceConfig } from '../../Utils/WdkService';
import { User, UserPreferences } from '../../Utils/WdkUser';

const CONFIG = "config";
const ONTOLOGY = "ontology";
const QUESTIONS = "questions";
const RECORDCLASSES = "recordClasses";
const USER = "user";
const PREFERENCES = "preferences";

export type StaticData = {
  config: ServiceConfig;
  ontology: CategoryOntology;
  questions: Question[];
  recordClasses: RecordClass[];
  user: User;
  preferences: UserPreferences;
}

type StaticDataActionTypes = {
  config: 'static/config-loaded';
  ontology: 'static/categories-loaded';
  questions: 'static/questions-loaded';
  recordClasses: 'static/recordClasses-loaded';
  user: 'static/user-loaded';
  preferences: 'static/preferences-loaded';
}

type StaticDataActions<K extends keyof StaticData> = {
  type: StaticDataActionTypes[K];
  payload: Pick<StaticData, K>
}


// actions triggered by individual static data loads
export type ConfigAction = StaticDataActions<typeof CONFIG>
export type OntologyAction = StaticDataActions<typeof ONTOLOGY>
export type QuestionsAction = StaticDataActions<typeof QUESTIONS>
export type RecordClassesAction = StaticDataActions<typeof RECORDCLASSES>
export type UserAction = StaticDataActions<typeof USER>
export type PreferencesAction = StaticDataActions<typeof PREFERENCES>

// action triggered when all static data loaded
export type AllDataAction = {
  type: "static/all-data-loaded",
  payload: StaticData
}

// action triggered if static data could not be loaded
export type LoadErrorAction = {
  type: "static/load-error",
  payload: { error: Error }
}

export type StaticDataAction = ConfigAction
                             | OntologyAction
                             | QuestionsAction
                             | RecordClassesAction
                             | UserAction
                             | PreferencesAction

type StaticDataKey = keyof StaticData;

type StaticDataConfigMapEntry<K extends keyof StaticData> = {
  elementName: K;
  serviceCall: string;
  actionType: StaticDataActions<K>['type']
}

type StaticDataConfigMap = {
  [K in keyof StaticData]: StaticDataConfigMapEntry<K>
}

export let staticDataConfigMap: StaticDataConfigMap = {
  config: {
    elementName: CONFIG, serviceCall: 'getConfig', actionType: 'static/config-loaded'
  },
  ontology: {
    elementName: ONTOLOGY, serviceCall: 'getOntology', actionType: 'static/categories-loaded'
  },
  questions: {
    elementName: QUESTIONS, serviceCall: 'getQuestions', actionType: 'static/questions-loaded'
  },
  recordClasses: {
    elementName: RECORDCLASSES, serviceCall: 'getRecordClasses', actionType: 'static/recordClasses-loaded'
  },
  user: {
    elementName: USER, serviceCall: 'getCurrentUser', actionType: 'static/user-loaded'
  },
  preferences: {
    elementName: PREFERENCES, serviceCall: 'getCurrentUserPreferences', actionType: 'static/preferences-loaded'
  }
};

// these entry points are not used directly by WDK, which loads all at once using loadAllStaticData()
export function loadConfig() { return getLoader(CONFIG); }
export function loadOntology() { return getLoader(ONTOLOGY); }
export function loadQuestions() { return getLoader(QUESTIONS); }
export function loadRecordClasses() { return getLoader(RECORDCLASSES); }
export function loadUser() { return getLoader(USER); }
export function loadPreferences() { return getLoader(PREFERENCES); }

function handleLoadError(error: Error): LoadErrorAction {
  console.error(error);
  return broadcast({
    type: 'static/load-error',
    payload: { error }
  }) as LoadErrorAction;
}

function getPromise(
  dataItemName: StaticDataKey,
  wdkService: WdkService
): Promise<StaticDataAction> {
  let { elementName, serviceCall, actionType } = staticDataConfigMap[dataItemName];
  return (wdkService as any)[serviceCall]().then((element: StaticData[typeof elementName]) => {
    console.debug("WDK " + elementName + " loaded");
    return broadcast({
      type: actionType,
      payload: { [elementName]: element }
    }) as StaticDataAction;
  });
}

function getLoader(dataItemName: StaticDataKey): ActionThunk<StaticDataAction|LoadErrorAction> {
  return function run({ wdkService }) {
    return getPromise(dataItemName, wdkService)
      .catch((error: Error) => handleLoadError(error));
  };
};

export function loadAllStaticData(): ActionThunk<AllDataAction|StaticDataAction|LoadErrorAction> {
  let dataItemKeys = Object.keys(staticDataConfigMap) as StaticDataKey[];
  return function run({ wdkService }) {
    let promiseArray = dataItemKeys.map(key => getPromise(key as StaticDataKey, wdkService));
    return [
      promiseArray,
      Promise.all(promiseArray).then(resultArray => {
        let allDataAction = resultArray.reduce((action, result) => ({
          ...action,
          payload: {
            ...action.payload,
            ...result.payload
          }
        }), { type: 'static/all-data-loaded', payload: {} } as AllDataAction)
        console.debug("WDK static data loaded");
        return broadcast(allDataAction);
      }).catch((error: Error) => handleLoadError(error))
    ];
  };
};
