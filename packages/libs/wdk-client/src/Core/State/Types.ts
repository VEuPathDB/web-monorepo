import storeModules from 'wdk-client/Core/State/StoreModules';

type StoreModules = typeof storeModules;

export type RootState = {
  [K in keyof StoreModules]: ReturnType<StoreModules[K]['reduce']>
}