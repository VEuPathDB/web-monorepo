import React, { DependencyList, useContext, useEffect } from 'react';

import { EpicDependencies } from 'wdk-client/Core/Store';

export type WdkDependencies = EpicDependencies;

// Identical to React.EffectCallback, save that the callback receives WdkService as a parameter
export type DepEffectCallback<T> = ((dep: T) => void) | ((dep: T) => void | undefined);

// FIXME Figure out a way to make the context type WdkDependencies (as opposed to WdkDependencies | undefined)
// FIXME One approach would be to create the context in main.js
export const WdkDepdendenciesContext = React.createContext<WdkDependencies | undefined>(undefined);

export type WdkDependenciesEffectCallback = DepEffectCallback<WdkDependencies>;

export const useWdkDependenciesEffect = (effect: WdkDependenciesEffectCallback, deps?: DependencyList): void => {
  const wdkDependencies = useContext(WdkDepdendenciesContext);

  useEffect(() => {
    if (wdkDependencies == null) {
      throw new Error('useWdkDependenciesEffect requires WdkDependencies to be provided via React context');
    }

    return effect(wdkDependencies);
  }, deps);
};
