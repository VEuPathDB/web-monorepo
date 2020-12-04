import { memoize } from 'lodash';
import { Decoder, arrayOf, oneOf, number, string, boolean, decode, constant, combine, field } from 'wdk-client/Utils/Json';
import WdkService, {useWdkEffect} from 'wdk-client/Service/WdkService';
import {useState} from 'react';

/**
 * Configuration of available preferences used by the system.
 *
 * A preference is a value that gets persisted across application runs.
 * The persistence level can be configured (see PersistenceLevel).
 */
export const preferences = {

  navigationVisible: memoize((recordClassUrlSegment: string) => makePreference(
    'navigationVisible',
    boolean,
    PersistenceLevel.Local,
    `wdk/navigationVisible/${recordClassUrlSegment}`
  )),

  openedStrategiesVisibility: memoize(() => makePreference(
    'openedStrategiesVisibility',
    boolean,
    PersistenceLevel.Session,
    'wdk/openedStrategiesVisibility'
  )),

  openedStrategies: memoize(() => makePreference(
    'openedStrategies',
    arrayOf(number),
    PersistenceLevel.Local,
    'wdk/openedStrategies'
  )),

  saveAsSort: memoize(() => makePreference(
    'saveAsSort',
    combine(
      field('columnKey', string),
      field('direction', oneOf(constant('asc'), constant('desc')))
    ),
    PersistenceLevel.Session,
    'wdk/saveAsSort'
  )),

  /* this is currently handled in a different file. here for reference.
  searchColumns: memoize((searchName: string) => makePreference(
    'searchColumns',
    arrayOf(string),
    PersistenceLevel.Project,
    `${searchName}_summary`
  ))
   */

}

/**
 * Persistence levels
 */
export const enum PersistenceLevel {
  /** Browsing session lifetime */
  Session = 'session',
  /** BrowseinghHistory lifetime */
  Local = 'local',
  Project = 'project',
  Global = 'global'
}

export interface Preference<T extends string, S> {
  /** identifies the type of preference */
  type: T;
  /** Key used to get value from persistence store. */
  persistenceKey: string;
  /** Level of persistence. Determines the persistence store. */
  persistenceLevel: PersistenceLevel;
  /** Parse string value into javascript value */
  parse: (rawValue: string) => S
}

export type Preferences = typeof preferences;
export type PreferenceEntry = ReturnType<Preferences[keyof Preferences]>;
export type PreferenceType<T> = T extends Preference<infer R, infer S> ? S : never;

function makePreference<T extends string, S>(type: T, decoder: Decoder<S>, persistenceLevel: PersistenceLevel, persistenceKey: string = type): Preference<T, S> {
  const parse = memoize((rawValue: string) => decode(decoder, rawValue));
  return {
    type,
    parse,
    persistenceLevel,
    persistenceKey
  }
}

export async function getValue<T extends PreferenceEntry>(wdkService: WdkService, preference: T): Promise<PreferenceType<T> | undefined> {
  switch (preference.persistenceLevel) {
    case PersistenceLevel.Session: {
      const rawValue = window.sessionStorage.getItem(preference.persistenceKey);
      if (rawValue == null) return undefined;
      return tryParse(rawValue);
    }
    case PersistenceLevel.Local: {
      const rawValue = window.localStorage.getItem(preference.persistenceKey);
      if (rawValue == null) return undefined;
      return tryParse(rawValue);
    }
    case PersistenceLevel.Project: {
      const preferences = await wdkService.getCurrentUserPreferences();
      const rawValue = preferences.project[preference.persistenceKey];
      if (rawValue == null) return undefined;
      return tryParse(rawValue);
    }
    case PersistenceLevel.Global: {
      const preferences = await wdkService.getCurrentUserPreferences();
      const rawValue = preferences.global[preference.persistenceKey];
      if (rawValue == null) return undefined;
      return tryParse(rawValue);
    }
  }

  function tryParse(rawValue: string) {
    try {
      return preference.parse(rawValue) as PreferenceType<T>;
    }
    catch(error) {
      return undefined;
    }
  }
}

export async function setValue<T extends PreferenceEntry>(wdkService: WdkService, preference: T, value: PreferenceType<PreferenceEntry>): Promise<void> {
  switch (preference.persistenceLevel) {
    case PersistenceLevel.Session: {
      window.sessionStorage.setItem(preference.persistenceKey, JSON.stringify(value));
      return;
    }
    case PersistenceLevel.Local: {
      window.localStorage.setItem(preference.persistenceKey, JSON.stringify(value));
      return;
    }
    case PersistenceLevel.Project: {
      wdkService.patchScopedUserPreferences('project', {
        [preference.persistenceKey]: JSON.stringify(value)
      });
      return;
    }
    case PersistenceLevel.Global: {
      wdkService.patchScopedUserPreferences('global', {
        [preference.persistenceKey]: JSON.stringify(value)
      });
      return;
    }
  }
}

/** React hook to use preferences in components */
export function usePreference<T extends PreferenceEntry>(preference: T, defaultValue?: PreferenceType<T>) {
  const [ preferenceValue, setPreferenceValue ] = useState<PreferenceType<T>>();
  useWdkEffect(wdkService => {
    (async () => {
      setPreferenceValue((await getValue(wdkService, preference)) || defaultValue);
    })();
  }, [preference]);

  useWdkEffect(wdkService => {
    if (preferenceValue) setValue(wdkService, preference, preferenceValue);
  }, [preferenceValue]);

  return [ preferenceValue, setPreferenceValue ] as [ typeof preferenceValue, typeof setPreferenceValue ];
}
