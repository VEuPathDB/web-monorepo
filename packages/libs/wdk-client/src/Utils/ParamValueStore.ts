import { memoize } from 'lodash';
import localforage from 'localforage';

import { WdkService } from '../Core';
import { ParameterValues } from '../Utils/WdkModel';

const SERVICE_VERSION_STORE_KEY = '__service-version';
const USER_ID_STORE_KEY = '__user-id';

export type GlobalParamMapping = {
  [ParamName in string]: string;
};
export interface ParamValueStore {
  clearParamValues: () => Promise<void>;

  fetchParamValues: (
    paramContext: string,
    globalParamMapping?: GlobalParamMapping
  ) => Promise<ParameterValues | null>;

  removeParamValueEntry: (paramContext: string) => Promise<void>;

  updateParamValues: (
    paramContext: string,
    newParamValues: ParameterValues,
    globalParamMapping?: GlobalParamMapping
  ) => Promise<ParameterValues>;
}

export const getInstance = memoize(makeInstance, (serviceUrl) => serviceUrl);

function makeInstance(
  serviceUrl: string,
  wdkService: WdkService
): ParamValueStore {
  const _store = localforage.createInstance({
    name: `ParamValueStore/${serviceUrl}`,
  });

  function _fetchServiceVersion(): Promise<number | null> {
    return _store.getItem(SERVICE_VERSION_STORE_KEY);
  }

  function _fetchUserId(): Promise<number | null> {
    return _store.getItem(USER_ID_STORE_KEY);
  }

  async function _checkServiceVersionAndUserId(
    options: { forceUser?: boolean } = {}
  ): Promise<[number, number]> {
    const [
      storeServiceVersion,
      storeUserId,
      currentServiceVersion,
      { id: currentUserId },
    ] = await Promise.all([
      _fetchServiceVersion(),
      _fetchUserId(),
      wdkService.getVersion(),
      wdkService.getCurrentUser({ force: options.forceUser }),
    ] as const);

    const serviceChanged =
      storeServiceVersion != null &&
      storeServiceVersion !== currentServiceVersion;

    const userChanged = storeUserId != null && storeUserId !== currentUserId;

    if (serviceChanged || userChanged) {
      await _store.clear();
    }

    return Promise.all([
      _store.setItem(SERVICE_VERSION_STORE_KEY, currentServiceVersion),
      _store.setItem(USER_ID_STORE_KEY, currentUserId),
    ] as const);
  }

  return {
    clearParamValues: () => {
      return _store.clear();
    },
    fetchParamValues: async (paramContext, globalParamMapping) => {
      await _checkServiceVersionAndUserId({ forceUser: true });

      const storeKey = makeParamStoreKey(paramContext);

      let paramValues = await _store.getItem<ParameterValues>(storeKey);

      if (globalParamMapping) {
        paramValues ??= {};

        for (const [paramName, key] of Object.entries(globalParamMapping)) {
          const value = await _store.getItem<string>(key);
          if (value) {
            paramValues[paramName] = value;
          }
        }
      }

      return paramValues;
    },
    removeParamValueEntry: (paramContext: string) => {
      const storeKey = makeParamStoreKey(paramContext);

      return _store.removeItem(storeKey);
    },
    updateParamValues: async (
      paramContext,
      newParamValues,
      globalParamMapping
    ) => {
      await _checkServiceVersionAndUserId();

      const storeKey = makeParamStoreKey(paramContext);

      await _store.setItem(storeKey, newParamValues);

      if (globalParamMapping) {
        for (const [paramName, key] of Object.entries(globalParamMapping)) {
          if (paramName in newParamValues) {
            await _store.setItem(key, newParamValues[paramName]);
          }
        }
      }

      return newParamValues;
    },
  };
}

function makeParamStoreKey(paramContext: string) {
  return `param-values/${paramContext}`;
}
