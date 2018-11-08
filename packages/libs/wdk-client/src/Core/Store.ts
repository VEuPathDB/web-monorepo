import { compose, mapKeys, mapValues, partialRight, values } from 'lodash/fp';
import { applyMiddleware, combineReducers, createStore, Reducer } from 'redux';
import { combineEpics, createEpicMiddleware, Epic } from 'redux-observable';
import { EMPTY } from 'rxjs';
import { Action } from 'wdk-client/Actions';
import { PageTransitioner } from 'wdk-client/Utils/PageTransitioner';
import WdkService from 'wdk-client/Utils/WdkService';
import { LocatePlugin } from 'wdk-client/Core/CommonTypes';
import { wdkMiddleware } from 'wdk-client/Core/WdkMiddleware';

declare global{
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: Function;
  }
}

export type EpicDependencies = {
  locatePlugin: LocatePlugin;
  wdkService: WdkService;
}
export type ModuleReducer<T> = (state: T | undefined, action: Action, locatePlugin: LocatePlugin) => T;
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

export function createWdkStore<T>(storeModules: StoreModuleRecord<T>, locatePlugin: LocatePlugin, wdkService: WdkService, transitioner: PageTransitioner) {
  const rootReducer = makeRootReducer(storeModules, locatePlugin);
  const rootEpic = makeRootEpic(storeModules);
  const epicMiddleware = createEpicMiddleware<Action, Action, T, EpicDependencies>({
    dependencies: { locatePlugin, wdkService }
  });

  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      name: 'WDKClient'
    })
    : compose;

  const enhancer = composeEnhancers(
    applyMiddleware(
      wdkMiddleware({ wdkService, transitioner }),
      epicMiddleware
    )
  );

  const store = createStore(rootReducer, enhancer);
  epicMiddleware.run(rootEpic);
  return store;
}

function makeRootReducer<T extends Record<string, any>>(storeModules: StoreModuleRecord<T>, locatePlugin: LocatePlugin): RootReducer<T[keyof T]> {
  const reducers = mapValues<StoreModuleRecord<T>, SubReducer<T>>(m => partialRight(m.reduce, [locatePlugin]), storeModules);
  const keyedReducers = mapKeys(moduleKey => storeModules[moduleKey].key, reducers);

  return combineReducers(keyedReducers);
}

function makeRootEpic<T extends Record<string, any>>(storeModules: StoreModuleRecord<T>): ModuleEpic<T> {
  const epics = values(storeModules)
    .map(({ observe }: StoreModule<T>): ModuleEpic<T> => (action$, state$, deps) => {
      return observe
        ? observe(action$, state$, deps)
        : EMPTY;
    });
  return combineEpics(...epics);
}
