import { memoize } from 'lodash';
import localforage from 'localforage';

import { WdkService } from 'wdk-client/Core';
import { SearchConfig } from 'wdk-client/Utils/WdkModel';

type ParamValues = SearchConfig['parameters'];

interface ParamValueStore {
  clearParamValues: () => Promise<void>;

  fetchParamValues: (
    prefix: string | undefined,
    recordClassUrlSegment: string,
    searchUrlSegment: string,
    parameterName: string,
  ) => Promise<ParamValues>;

  updateParamValues: (
    newParamValues: ParamValues,
    prefix: string | undefined,
    recordClassUrlSegment: string,
    searchUrlSegment: string,
    parameterName: string
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
    fetchParamValues: (...args) => {
      const storeKey = makeStoreKey(...args);

      return _store.getItem(storeKey);
    },
    updateParamValues: (newParamValues, ...keyArgs) => {
      const storeKey = makeStoreKey(...keyArgs);

      return _store.setItem(storeKey, newParamValues);
    }
  };
}

function makeStoreKey(
  prefix: string | undefined,
  recordClassUrlSegment: string,
  searchUrlSegment: string,
  parameterName: string
) {
  return `${prefix ?? 'parameter'}/${recordClassUrlSegment}/${searchUrlSegment}/${parameterName}`;
}
