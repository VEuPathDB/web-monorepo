import { compose, mapKeys, mapValues, values } from 'lodash/fp';
import { applyMiddleware, combineReducers, createStore, Reducer, Middleware, Action } from 'redux';
import { combineEpics, createEpicMiddleware, Epic } from 'redux-observable';
import { EMPTY } from 'rxjs';
import { PageTransitioner } from 'wdk-client/Utils/PageTransitioner';
import WdkService from 'wdk-client/Service/WdkService';
import { wdkMiddleware } from 'wdk-client/Core/WdkMiddleware';
import { catchError } from 'rxjs/operators';
import { alert } from 'wdk-client/Utils/Platform';

declare global{
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: Function;
  }
}

export type EpicDependencies = {
  wdkService: WdkService;
  transitioner: PageTransitioner;
}
export type ModuleReducer<T, A extends Action> = (state: T | undefined, action: A) => T;
export type ModuleEpic<T, A extends Action> = Epic<A, A, T, EpicDependencies>;

export type StoreModule<T, A extends Action> = {
  key: string;
  reduce: ModuleReducer<T, A>;
  observe?: ModuleEpic<T, A>;
}

type StoreModuleRecord<T extends Record<string, any>, A extends Action> = {
  [K in keyof T]: StoreModule<T, A>
};

type RootReducer<T, A extends Action> = Reducer<T, A>;

export function createWdkStore<T, A extends Action>(
  storeModules: StoreModuleRecord<T, A>,
  wdkService: WdkService,
  transitioner: PageTransitioner,
  // FIXME Figure out how to allow the order of middleware to be configured
  additionalMiddleware: Middleware[] = []
) {
  const rootReducer = makeRootReducer(storeModules);
  const rootEpic = makeRootEpic(storeModules);
  const epicMiddleware = createEpicMiddleware<A, A, T, EpicDependencies>({
    dependencies: { wdkService, transitioner }
  });

  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      name: 'WDKClient'
    })
    : compose;

  const enhancer = composeEnhancers(
    applyMiddleware(
      ...additionalMiddleware,
      wdkMiddleware({ wdkService, transitioner }),
      epicMiddleware,
    )
  );

  const store = createStore(rootReducer, enhancer);
  epicMiddleware.run(rootEpic);
  return store;
}

function makeRootReducer<T extends Record<string, any>, A extends Action>(storeModules: StoreModuleRecord<T, A>): RootReducer<T[string]['key'], A> {
  const reducers = mapValues(m => m.reduce, storeModules);
  const keyedReducers = mapKeys(moduleKey => storeModules[moduleKey].key, reducers);
  return combineReducers(keyedReducers);
}

function makeRootEpic<T extends Record<string, any>, A extends Action>(storeModules: StoreModuleRecord<T, A>): ModuleEpic<T, A> {
  const epics = values(storeModules)
    .map(({ observe }: StoreModule<T, A>): ModuleEpic<T, A> => (action$, state$, deps) => {
      return observe
        ? observe(action$, state$, deps).pipe(
          catchError((error, caught) => {
            // FIXME See https://redmine.apidb.org/issues/34824
            const message = 'status' in error && 'response' in error && error.status === 422
              ? error.response
              : 'An error was encountered.';
            alert('Oops... something went wrong!', message);
            deps.wdkService.submitErrorIfNot500(error);
            return caught;
          })
        )
        : EMPTY;
    });
  return combineEpics(...epics);
}
