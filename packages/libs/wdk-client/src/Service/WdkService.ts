import { memoize } from 'lodash';
import React, { useContext, useEffect } from 'react';
import { composeMixins, CompositeService as WdkService } from 'wdk-client/Service/ServiceMixins';

export default WdkService;

// Identical to React.EffectCallback, save that the callback receives WdkService as a parameter
export type WdkEffectCallback = ((wdkService: WdkService) => void) | ((wdkService: WdkService) => void | undefined);

// Memoize based on serviceUrl, so that we only create one instance per
// serviceUrl. This will ensure that multiple caches are not created.
export const getInstance = memoize(composeMixins);

// FIXME Figure out a way to make the context type WdkService (as opposed to WdkService | undefined)
export const WdkServiceContext = React.createContext<WdkService | undefined>(undefined);

export const useWdkEffect = (effect: WdkEffectCallback, deps?: any[]): void => {
  const wdkService = useContext(WdkServiceContext);

  useEffect(() => {
    if (!wdkService) {
      throw new Error('useWdkEffect requires a WdkService to be provided via React context');
    }

    return effect(wdkService);
  }, deps);
};
