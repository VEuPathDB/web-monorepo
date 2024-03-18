import { bindActionCreators } from 'redux';
import { DispatchAction } from '../Core/CommonTypes';
import { CategoryOntology } from '../Utils/CategoryUtils';
import { Question, RecordClass } from '../Utils/WdkModel';
import { ServiceConfig } from '../Service/ServiceBase';
import { User, UserPreferences } from '../Utils/WdkUser';
import { makeActionCreator, InferAction } from '../Utils/ActionCreatorUtils';
import { CompositeService } from '../Service/ServiceMixins';

export const configLoaded = makeActionCreator(
  'static/config-loaded',
  (config: ServiceConfig) => ({ config })
);

export const ontologyLoaded = makeActionCreator(
  'static/ontology-loaded',
  (ontology: CategoryOntology) => ({ ontology })
);

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

export const allDataLoaded = makeActionCreator('static/all-data-loaded');

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
  | InferAction<typeof loadError>;

// TODO Refactor this using mrate
export async function loadAllStaticData(
  wdkService: CompositeService,
  dispatch: DispatchAction
) {
  const staticDataFulfillers = bindActionCreators(
    {
      configLoaded,
      ontologyLoaded,
      questionsLoaded,
      recordClassesLoaded,
      userLoaded,
      preferencesLoaded,
      allDataLoaded,
      loadError,
    },
    dispatch
  );

  try {
    // Call this endpoint before calling the rest. This ensures that we don't get
    // conflicting Set-Cookie headers
    const config = await wdkService.getConfig();
    // Call these in parallel
    await Promise.all([
      staticDataFulfillers.configLoaded(config),
      staticDataFulfillers.ontologyLoaded(
        await wdkService.getOntology(config.categoriesOntologyName)
      ),
      staticDataFulfillers.questionsLoaded(await wdkService.getQuestions()),
      staticDataFulfillers.recordClassesLoaded(
        await wdkService.getRecordClasses()
      ),
      staticDataFulfillers.userLoaded(await wdkService.getCurrentUser()),
      staticDataFulfillers.preferencesLoaded(
        await wdkService.getCurrentUserPreferences()
      ),
    ]);
    staticDataFulfillers.allDataLoaded();
  } catch (error) {
    staticDataFulfillers.loadError(
      error instanceof Error ? error : new Error(String(error))
    );
  }
}
