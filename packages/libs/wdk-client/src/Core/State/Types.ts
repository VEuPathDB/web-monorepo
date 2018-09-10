import storeModules from './StoreModules';

type StoreModules = typeof storeModules;

type Reducers = {
  [K in keyof StoreModules]: StoreModules[K]['reduce']
}

export type RootState = {
  [K in keyof Reducers]: ReturnType<Reducers[K]>
}
