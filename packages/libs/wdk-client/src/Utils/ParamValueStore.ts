import { memoize } from 'lodash';
import localforage from 'localforage';

import { WdkService } from 'wdk-client/Core';
import { ParameterValues } from 'wdk-client/Utils/WdkModel';

const SERVICE_VERSION_STORE_KEY = '__service-version';
const USER_ID_STORE_KEY = '__user-id';

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

  function _fetchServiceVersion(): Promise<number | null> {
    return _store.getItem(SERVICE_VERSION_STORE_KEY);
  }

  function _fetchUserId(): Promise<number | null> {
    return _store.getItem(USER_ID_STORE_KEY);
  }

  async function _checkServiceVersionAndUserId(options: { forceUser?: boolean } = {}): Promise<[number, number]> {
    const [ storeServiceVersion, storeUserId, currentServiceVersion, { id: currentUserId } ] = await Promise.all([
      _fetchServiceVersion(),
      _fetchUserId(),
      wdkService.getVersion(),
      wdkService.getCurrentUser({ force: options.forceUser })
    ] as const);

    const serviceChanged = (
      storeServiceVersion != null &&
      storeServiceVersion !== currentServiceVersion
    );

    const userChanged = (
      storeUserId != null &&
      storeUserId !== currentUserId
    );

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
    fetchParamValues: async paramContext => {
      await _checkServiceVersionAndUserId({ forceUser: true });

      const storeKey = makeParamStoreKey(paramContext);

      return _store.getItem(storeKey);
    },
    removeParamValueEntry: (paramContext: string) => {
      const storeKey = makeParamStoreKey(paramContext);

      return _store.removeItem(storeKey);
    },
    updateParamValues: async (paramContext, newParamValues) => {
      await _checkServiceVersionAndUserId();

      const storeKey = makeParamStoreKey(paramContext);

      return _store.setItem(storeKey, newParamValues);
    }
  };
}

function makeParamStoreKey(paramContext: string) {
  return `param-values/${paramContext}`;
}
