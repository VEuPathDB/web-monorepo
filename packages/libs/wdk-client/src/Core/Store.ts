import { compose, mapKeys, mapValues, values } from 'lodash/fp';
import { applyMiddleware, combineReducers, createStore, Reducer, Middleware } from 'redux';
import { combineEpics, createEpicMiddleware, Epic } from 'redux-observable';
import { EMPTY } from 'rxjs';
import { Action } from 'wdk-client/Actions';
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
export type ModuleReducer<T> = (state: T | undefined, action: Action) => T;
export type ModuleEpic<T> = Epic<Action, Action, T, EpicDependencies>;

export type StoreModule<T> = {
  key: string;
  reduce: ModuleReducer<T>;
  observe?: ModuleEpic<T>;
}

type StoreModuleRecord<T extends Record<string, any>> = {
  [K in keyof T]: StoreModule<T[K]>
};

type RootReducer<T> = Reducer<T, Action>;
type SubReducer<T> = Reducer<T[keyof T], Action>;

export function createWdkStore<T>(
  storeModules: StoreModuleRecord<T>,
  wdkService: WdkService,
  transitioner: PageTransitioner,
  // FIXME Figure out how to allow the order of middleware to be configured
  additionalMiddleware: Middleware[] = []
) {
  const rootReducer = makeRootReducer(storeModules);
  const rootEpic = makeRootEpic(storeModules);
  const epicMiddleware = createEpicMiddleware<Action, Action, T, EpicDependencies>({
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

function makeRootReducer<T extends Record<string, any>>(storeModules: StoreModuleRecord<T>): RootReducer<T[keyof T]> {
  const reducers = mapValues<StoreModuleRecord<T>, SubReducer<T>>(m => m.reduce, storeModules);
  const keyedReducers = mapKeys(moduleKey => storeModules[moduleKey].key, reducers);

  return combineReducers(keyedReducers);
}

function makeRootEpic<T extends Record<string, any>>(storeModules: StoreModuleRecord<T>): ModuleEpic<T> {
  const epics = values(storeModules)
    .map(({ observe }: StoreModule<T>): ModuleEpic<T> => (action$, state$, deps) => {
      return observe
        ? observe(action$, state$, deps).pipe(
          catchError((error, caught) => {
            // FIXME See https://redmine.apidb.org/issues/34824
            const message = 'status' in error && 'response' in error && error.status === 422
              ? error.response
              : 'An error was encountered.';
            alert('Oops... something went wrong!', message);
            return caught;
          })
        )
        : EMPTY;
    });
  return combineEpics(...epics);
}
