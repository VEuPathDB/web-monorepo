import { memoize } from 'lodash';
import React from 'react';
import { empty, merge, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { DispatchAction } from '../Core/CommonTypes';
import WdkService from './WdkService';

import { Action, ObserveServices } from './ActionCreatorUtils';

export interface ClientPlugin<T = object> {
  reduce(state: T | undefined, action: Action): T;
  render(state: T, dispatch: DispatchAction): React.ReactNode;
  // FIXME Replace ObserveServices with ObserverServices
  observe(action$: Observable<Action>, services: ObserveServices): Observable<Action>;
}

export interface CompositeClientPlugin {
  reduce: <T>(context: PluginContext, state: T, action: Action) => T;
  render: <T>(context: PluginContext, state: T, dispatch: (action: Action) => void) => React.ReactNode;
  observe: (contextActionPair$: Observable<[PluginContext, Action]>, service: ObserveServices) => Observable<Action>;
}

export interface PluginContext {
  type: string;
  name: string;
  recordClassName?: string;
  questionName?: string;
}

/**
 * An entry for a ClientPlugin.
 * 
 * @example
 * {
 *   type: 'attributeReporter',
 *   name: 'wordCloud',
 *   plugin: WordCloudPlugin
 * }
 * 
 * @example
 * {
 *   type: 'attributeReporter',
 *   name: 'wordCloud',
 *   recordClassName: 'transcript',
 *   plugin: WordCloudTranscriptPlugin
 * }
 * 
 * @example
 * {
 *   type: 'downloadForm',
 *   name: 'gff',
 *   recordClass: 'gene',
 *   plugin: GeneGffDownloadForm
 * }
 * 
 * @example
 * {
 *   type: 'recordPageAttribute',
 *   name: 'gbrowse',
 *   recordClassName: 'gene',
 *   plugin: GbrowseGeneAttribute
 * }
 * 
 */
export interface ClientPluginRegistryEntry {
  type: string;
  name?: string;
  recordClassName?: string;
  questionName?: string;
  plugin: ClientPlugin;
}

interface ObserverServices<T> {
  wdkService: WdkService;
  getState(): T;
}

export function createPlugin<T extends object>(pluginSpec: Partial<ClientPlugin<T>>): Readonly<ClientPlugin> {
  const {
    render = defaultRender,
    reduce = defaultReduce,
    observe = defaultObserve
  } = pluginSpec;
  return { render, reduce, observe };
}

export function mergePluginsByType(registry: ClientPluginRegistryEntry[], type: string) {
  const entries = registry.filter(entry => entry.type === type);
  const locate = findPlugin(entries);
  const reduce = mergeReduce(locate);
  const render = mergeRender(locate);
  const observe = mergeObserve(entries);
  return { reduce, render, observe };
}

type LocatePlugin = (context: PluginContext) => ClientPlugin | void;

const findPlugin = (registry: ClientPluginRegistryEntry[]) => memoize((context: PluginContext): ClientPlugin | void => {
  const entry = registry.find(entry => isMatchingEntry(entry, context));
  return entry && entry.plugin;
}, JSON.stringify)

function mergeReduce(locate: LocatePlugin) {
  return function reduce<T extends object | undefined>(context: PluginContext, state: T, action: Action) {
    const plugin = locate(context);
    return plugin ? plugin.reduce(state, action) : defaultReduce(state, action);
  }
}

function mergeRender(locate: LocatePlugin) {
  return function render<T extends object>(context: PluginContext, state: T, dispatch: DispatchAction) {
    const plugin = locate(context);
    return plugin ? plugin.render(state, dispatch) : defaultRender(state, dispatch);
  }
}

function mergeObserve(entries: ClientPluginRegistryEntry[]) {
  return function observe(actionContextPair$: Observable<[PluginContext, Action]>, services: ObserveServices): Observable<Action> {
    // Fold entries into in$ and out$ Observables by incrementally filtering out
    // actions that match a plugin entry.
    //
    // We start with an empty Observable for out$, and the context/action pair
    // for in$. For each entry, we filter out matching pairs from in$, and we
    // merge the entry's Observable with out$. In the end, out$ will be an
    // Observable of all entry actions, and in$ will be whatever did not match
    // an entry.
    //
    // This makes it possible to preserve LIFO logic with matching an entry to
    // a context. That is to say, the first entry to match a context will handle
    // the action.
    //
    // This also makes it possible to only call observe (e.g., construct the
    // plugin Observable) once.
    const reduced = entries.reduce(({ in$, out$ }, entry) => {
      const entryIn$ = in$.pipe(filter(([context]) => isMatchingEntry(entry, context)));
      const restIn$ = in$.pipe(filter(([context]) => !isMatchingEntry(entry, context)));
      const action$ = entryIn$.pipe(map(entryIn => entryIn[1]));
      return {
        in$: restIn$,
        out$: merge(out$, entry.plugin.observe(action$, services))
      };
    }, { in$: actionContextPair$, out$: empty() as Observable<Action>});
    return reduced.out$;
  }
}

function isMatchingEntry(entry: ClientPluginRegistryEntry, context: PluginContext): boolean {
  if (entry.type !== context.type) return false;
  if (entry.name && entry.name !== context.name) return false;
  if (entry.recordClassName && context.recordClassName && entry.recordClassName !== context.recordClassName) return false;
  if (entry.questionName && context.questionName && entry.questionName !== context.questionName) return false;
  return true;
}


// Default implementations
function defaultRender(state: any, dispatch: DispatchAction) {
  return null;
}

function defaultReduce(state: any, action: Action) {
  return state;
}

function defaultObserve(action$: Observable<Action>, services: any) {
  return empty() as Observable<Action>;
}
