import { compose, entries, mapValues, partialRight } from 'lodash/fp';
import { applyMiddleware, combineReducers, createStore, Reducer } from 'redux';
import { combineEpics, createEpicMiddleware, Epic, StateObservable } from 'redux-observable';
import { EMPTY, Subject } from 'rxjs';
import { map as mapObs } from 'rxjs/operators';
import { Action } from '../Utils/ActionCreatorUtils';
import { PageTransitioner } from '../Utils/PageTransitioner';
import WdkService from '../Utils/WdkService';
import { LocatePlugin } from './CommonTypes';
import { wdkMiddleware } from './WdkMiddleware';

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

function makeRootReducer<T extends Record<string, any>>(storeModules: StoreModuleRecord<T>, locatePlugin: LocatePlugin): RootReducer<T> {
  const reducers = mapValues<StoreModuleRecord<T>, SubReducer<T>>(m => partialRight(m.reduce, [locatePlugin]), storeModules);
  return combineReducers(reducers);
}

type StoreModuleRecordPair<T> = [ T, StoreModule<T> ];

function makeRootEpic<T extends Record<string, any>>(storeModules: StoreModuleRecord<T>): ModuleEpic<T> {
  const epics = entries(storeModules)
    .map(([key, { observe }]: StoreModuleRecordPair<keyof T>): ModuleEpic<T[keyof T]> => (action$, state$, deps) => {
      const childState$ = new StateObservable(
        // StateObservable only needs an Observable, so cast to Subject.
        // See https://github.com/redux-observable/redux-observable/issues/570
        state$.pipe(
          mapObs(state => state[key])
        ) as Subject<T[keyof T]>,
        state$.value[key]
      );
      return observe
        ? observe(action$, childState$, deps)
        : EMPTY;
    });
  return combineEpics(...epics);
}
