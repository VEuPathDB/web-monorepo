import { memoize } from 'lodash';
import localforage from 'localforage';

import { WdkService } from 'wdk-client/Core';
import { ParameterValues } from 'wdk-client/Utils/WdkModel';

export interface ParamValueStore {
  clearParamValues: () => Promise<void>;

  fetchParamValues: (paramContext: string) => Promise<ParameterValues | null>;

  updateParamValues: (
    paramContext: string,
    newParamValues: ParameterValues
  ) => Promise<ParameterValues>;
}

export const getInstance = memoize(makeInstance, serviceUrl => serviceUrl);

function makeInstance(serviceUrl: string, wdkService: WdkService): ParamValueStore {
  const _store = localforage.createInstance({
    name: `ParamValueStore/${serviceUrl}`
  });

  return {
    clearParamValues: () => {
      return _store.clear();
    },
    fetchParamValues: paramContext => {
      const storeKey = makeParamStoreKey(paramContext);

      return _store.getItem(storeKey);
    },
    updateParamValues: (paramContext, newParamValues) => {
      const storeKey = makeParamStoreKey(paramContext);

      return _store.setItem(storeKey, newParamValues);
    }
  };
}

function makeParamStoreKey(paramContext: string) {
  return `param-values/${paramContext}`;
}
