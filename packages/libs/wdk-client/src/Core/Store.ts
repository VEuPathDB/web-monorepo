import { compose, mapKeys, mapValues, omit, values } from 'lodash/fp';
import { applyMiddleware, combineReducers, createStore, Reducer, Middleware, Action } from 'redux';
import { combineEpics, createEpicMiddleware, Epic } from 'redux-observable';
import { EMPTY, Observable } from 'rxjs';
import { PageTransitioner } from 'wdk-client/Utils/PageTransitioner';
import { ParamValueStore } from 'wdk-client/Utils/ParamValueStore';
import WdkService from 'wdk-client/Service/WdkService';
import { wdkMiddleware } from 'wdk-client/Core/WdkMiddleware';
import { catchError, startWith } from 'rxjs/operators';
import { notifyUnhandledError } from 'wdk-client/Actions/UnhandledErrorActions';

declare global{
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: Function;
  }
}

export type EpicDependencies = {
  paramValueStore: ParamValueStore;
  transitioner: PageTransitioner;
  wdkService: WdkService;
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

export function createWdkStore<T, A extends Action, E extends EpicDependencies = EpicDependencies>(
  storeModules: StoreModuleRecord<T, A>,
  dependencies: E,
  // FIXME Figure out how to allow the order of middleware to be configured
  additionalMiddleware: Middleware[] = []
) {
  const rootReducer = makeRootReducer(storeModules);
  const rootEpic = makeRootEpic(storeModules);
  const epicMiddleware = createEpicMiddleware<A, A, T, E>({
    dependencies
  });

  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      name: 'WDKClient'
    })
    : compose;

  const enhancer = composeEnhancers(
    applyMiddleware(
      ...additionalMiddleware,
      wdkMiddleware(dependencies),
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
            return caught.pipe(
              startWith(notifyUnhandledError(error))
            ) as Observable<A>;
          })
        )
        : EMPTY;
    });
  return combineEpics(...epics);
}
