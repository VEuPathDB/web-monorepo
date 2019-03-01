import { combineReducers, Reducer, ReducersMapObject } from 'redux';
import { combineEpics, Epic } from 'redux-observable';

import { Action } from 'wdk-client/Actions';
import { EpicDependencies } from 'wdk-client/Core/Store';

export type ModuleEpic<T> = Epic<Action, Action, T, EpicDependencies>;

export interface StoreModule<T, K extends keyof T> {
  key: K;
  reduce?: Reducer<T[K]>;
  observe?: ModuleEpic<T>;
}

export interface RootStoreModule<T> {
  reduce: Reducer<T>;
  observe: ModuleEpic<T>;
}

export function mergeStoreModules<T, K extends keyof T>(
  storeModules: Record<K, StoreModule<T, K>>
): RootStoreModule<T> {
  const reduce = makeRootReducer(storeModules);
  const observe = makeRootEpic(storeModules);
  return { reduce, observe };
}

function makeRootReducer<T, K extends keyof T>(
  storeModules: Record<K, StoreModule<T, K>>
): Reducer<T, Action> {
  const reducers: ReducersMapObject<T> = Object.values(storeModules)
    .filter(hasMember('reduce'))
    .reduce(
      (reducerObject, storeModule) =>
        Object.assign(reducerObject, { [storeModule.key]: storeModule.reduce }),
      {} as ReducersMapObject<T>
    );
  return combineReducers<T>(reducers);
}

function makeRootEpic<T, K extends keyof T>(
  storeModules: Record<K, StoreModule<T, K>>
): ModuleEpic<T> {
  const epics = Object.values(storeModules)
    .filter(hasMember('observe'))
    .map(
      ({ observe }): ModuleEpic<T> => (action$, state$, deps) => {
        return observe(action$, state$, deps);
      }
    );
  return combineEpics(...epics);
}

const hasMember = <T, K extends keyof T, J extends keyof StoreModule<T, K>>(
  memberKey: J
) => (
  storeModule: StoreModule<T, K>
): storeModule is StoreModule<T, K> &
  { [Key in J]: NonNullable<StoreModule<T, K>[J]> } => memberKey in storeModule;
