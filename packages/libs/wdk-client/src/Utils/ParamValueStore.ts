import { memoize } from 'lodash';
import localforage from 'localforage';

import { WdkService } from 'wdk-client/Core';
import { ParameterValues } from 'wdk-client/Utils/WdkModel';

const MODEL_VERSION_STORE_KEY = '__version';

export interface ParamValueStore {
  clearParamValues: () => Promise<void>;

  fetchParamValues: (paramContext: string) => Promise<ParameterValues | null>;

  removeParamValueEntry: (paramContext: string) => Promise<void>;

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

  function _fetchVersionNumber(): Promise<number | null> {
    return _store.getItem(MODEL_VERSION_STORE_KEY);
  }

  async function _checkModelVersion(): Promise<number> {
    const [ storeVersion, serviceVersion ] = await Promise.all([
      _fetchVersionNumber(),
      wdkService.getVersion()
    ] as const);

    if (storeVersion != null && storeVersion !== serviceVersion) {
      await _store.clear();
    }

    return _store.setItem(MODEL_VERSION_STORE_KEY, serviceVersion);
  }

  return {
    clearParamValues: () => {
      return _store.clear();
    },
    fetchParamValues: async paramContext => {
      await _checkModelVersion();

      const storeKey = makeParamStoreKey(paramContext);

      return _store.getItem(storeKey);
    },
    removeParamValueEntry: (paramContext: string) => {
      const storeKey = makeParamStoreKey(paramContext);

      return _store.removeItem(storeKey);
    },
    updateParamValues: async (paramContext, newParamValues) => {
      await _checkModelVersion();

      const storeKey = makeParamStoreKey(paramContext);

      return _store.setItem(storeKey, newParamValues);
    }
  };
}

function makeParamStoreKey(paramContext: string) {
  return `param-values/${paramContext}`;
}
