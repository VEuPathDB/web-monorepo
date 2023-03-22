import { bindActionCreators } from 'redux';
import { DispatchAction } from 'wdk-client/Core/CommonTypes';
import { CategoryOntology } from 'wdk-client/Utils/CategoryUtils';
import { Question, RecordClass } from 'wdk-client/Utils/WdkModel';
import { ServiceConfig } from 'wdk-client/Service/ServiceBase';
import { User, UserPreferences } from 'wdk-client/Utils/WdkUser';
import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { CompositeService } from 'wdk-client/Service/ServiceMixins';

export const configLoaded = makeActionCreator(
  'static/config-loaded',
  (config: ServiceConfig) => ({ config })
);

export const ontologyLoaded = makeActionCreator(
  'static/ontology-loaded',
  (ontology: CategoryOntology) => ({ ontology })
)

export const questionsLoaded = makeActionCreator(
  'static/questions-loaded',
  (questions: Question[]) => ({ questions })
);

export const recordClassesLoaded = makeActionCreator(
  'static/recordClasses-loaded',
  (recordClasses: RecordClass[]) => ({ recordClasses })
);

export const userLoaded = makeActionCreator(
  'static/user-loaded',
  (user: User) => ({ user })
);

export const preferencesLoaded = makeActionCreator(
  'static/preferences-loaded',
  (preferences: UserPreferences) => ({ preferences })
);

export const allDataLoaded = makeActionCreator(
  'static/all-data-loaded'
);

export const loadError = makeActionCreator(
  'static/load-error',
  (error: Error) => ({ error })
);


export type Action =
  | InferAction<typeof configLoaded>
  | InferAction<typeof ontologyLoaded>
  | InferAction<typeof questionsLoaded>
  | InferAction<typeof recordClassesLoaded>
  | InferAction<typeof userLoaded>
  | InferAction<typeof preferencesLoaded>
  | InferAction<typeof allDataLoaded>
  | InferAction<typeof loadError>

// TODO Refactor this using mrate
export function loadAllStaticData(wdkService: CompositeService, dispatch: DispatchAction) {
  const staticDataFulfillers = bindActionCreators({
    configLoaded,
    ontologyLoaded,
    questionsLoaded,
    recordClassesLoaded,
    userLoaded,
    preferencesLoaded,
    allDataLoaded,
    loadError
  }, dispatch);

  const config$ = wdkService.getConfig();

  Promise.all([
    config$.then(staticDataFulfillers.configLoaded),
    config$.then(config => wdkService.getOntology(config.categoriesOntologyName)).then(staticDataFulfillers.ontologyLoaded),
    wdkService.getQuestions().then(staticDataFulfillers.questionsLoaded),
    wdkService.getRecordClasses().then(staticDataFulfillers.recordClassesLoaded),
    wdkService.getCurrentUser().then(staticDataFulfillers.userLoaded),
    wdkService.getCurrentUserPreferences().then(staticDataFulfillers.preferencesLoaded),
  ])
    .then(staticDataFulfillers.allDataLoaded)
    .catch(staticDataFulfillers.loadError);
}
