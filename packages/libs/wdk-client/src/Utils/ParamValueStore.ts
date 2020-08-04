import { memoize } from 'lodash';
import localforage from 'localforage';

import { WdkService } from 'wdk-client/Core';
import { SearchConfig } from 'wdk-client/Utils/WdkModel';

type ParamValues = SearchConfig['parameters'];

interface ParamValueStore {
  clearParamValues: () => Promise<void>;

  fetchParamValues: (
    prefix: string | undefined,
    parameterName: string
  ) => Promise<ParamValues>;

  updateParamValues: (
    prefix: string | undefined,
    parameterName: string,
    newParamValues: ParamValues
  ) => Promise<ParamValues>;
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
    fetchParamValues: (prefix, parameterName) => {
      const storeKey = makeStoreKey(prefix, parameterName);

      return _store.getItem(storeKey);
    },
    updateParamValues: (prefix, parameterName, newParamValues) => {
      const storeKey = makeStoreKey(prefix, parameterName);

      return _store.setItem(storeKey, newParamValues);
    }
  };
}

function makeStoreKey(
  prefix: string | undefined,
  parameterName: string
) {
  return `${prefix ?? 'parameter'}/${parameterName}`;
}
