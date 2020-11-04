import { DependencyList } from 'react';

import { memoize } from 'lodash';

import { DepEffectCallback, useWdkDependenciesEffect } from 'wdk-client/Hooks/WdkDependenciesEffect';
import { composeMixins, CompositeService as WdkService } from './ServiceMixins';

export default WdkService;

export type WdkEffectCallback = DepEffectCallback<WdkService>;

// Memoize based on serviceUrl, so that we only create one instance per
// serviceUrl. This will ensure that multiple caches are not created.
export const getInstance = memoize(composeMixins);

export const useWdkEffect = (effect: WdkEffectCallback, deps?: DependencyList): void => {
  useWdkDependenciesEffect(({ wdkService }) => {
    return effect(wdkService);
  }, deps);
};
