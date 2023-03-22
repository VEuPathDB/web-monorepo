import storeModules from 'wdk-client/StoreModules';

type StoreModules = typeof storeModules;

export type RootState = {
  [K in keyof StoreModules]: ReturnType<StoreModules[K]['reduce']>
}