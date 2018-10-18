import { memoize } from 'lodash';
import React from 'react';
import { empty, merge, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { Action } from './ActionCreatorUtils';
import { EpicDependencies } from '../Core/Store';
import { SimpleDispatch } from '../Core/CommonTypes';

export interface ClientPlugin<T> {
  reduce(state: T | undefined, action: Action): T;
  render(state: T, dispatch: SimpleDispatch): React.ReactNode;
  observe(action$: Observable<Action>, state$: Observable<T>, dependencies: EpicDependencies): Observable<Action>;
}

export interface CompositeClientPlugin<T> {
  reduce: (context: PluginContext, state: T | undefined, action: Action) => T;
  render: (context: PluginContext, state: T, dispatch: SimpleDispatch) => React.ReactNode;
  observe: (contextActionPair$: Observable<[PluginContext, Action]>, state$: Observable<T>, dependencies: EpicDependencies) => Observable<Action>;
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
export interface ClientPluginRegistryEntry<T> {
  type: string;
  name?: string;
  recordClassName?: string;
  questionName?: string;
  plugin: ClientPlugin<T>;
}

export function createPlugin<T>(pluginSpec: Partial<ClientPlugin<T>>): Readonly<ClientPlugin<T>> {
  const {
    render = defaultRender,
    reduce = defaultReduce,
    observe = defaultObserve
  } = pluginSpec;
  return { render, reduce, observe };
}

export function mergePluginsByType<T>(registry: ClientPluginRegistryEntry<T>[], type: string): CompositeClientPlugin<T> {
  const entries = registry.filter(entry => entry.type === type);
  const locate = findPlugin(entries);
  const reduce = mergeReduce(locate);
  const render = mergeRender(locate);
  const observe = mergeObserve(entries);
  return { reduce, render, observe };
}

type LocatePlugin<T> = (context: PluginContext) => ClientPlugin<T> | void;

const findPlugin = <T>(registry: ClientPluginRegistryEntry<T>[]): LocatePlugin<T> => memoize((context: PluginContext): ClientPlugin<T> | void => {
  const entry = registry.find(entry => isMatchingEntry(entry, context));
  return entry && entry.plugin;
}, JSON.stringify)

function mergeReduce<T>(locate: LocatePlugin<T>): CompositeClientPlugin<T>['reduce'] {
  return function reduce(context: PluginContext, state: T | undefined, action: Action) {
    const plugin = locate(context);
    return plugin ? plugin.reduce(state, action) : defaultReduce(state, action);
  }
}

function mergeRender<T>(locate: LocatePlugin<T>): CompositeClientPlugin<T>['render'] {
  return function render(context: PluginContext, state: T, dispatch: SimpleDispatch) {
    const plugin = locate(context);
    return plugin ? plugin.render(state, dispatch) : defaultRender(state, dispatch);
  }
}

function mergeObserve<T>(entries: ClientPluginRegistryEntry<T>[]): CompositeClientPlugin<T>['observe'] {
  return function observe(actionContextPair$: Observable<[PluginContext, Action]>, state$: Observable<T>, dependencies: EpicDependencies): Observable<Action> {
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
        out$: merge(out$, entry.plugin.observe(action$, state$, dependencies))
      };
    }, { in$: actionContextPair$, out$: empty() as Observable<Action>});
    return reduced.out$;
  }
}

function isMatchingEntry<T>(entry: ClientPluginRegistryEntry<T>, context: PluginContext): boolean {
  if (entry.type !== context.type) return false;
  if (entry.name && entry.name !== context.name) return false;
  if (entry.recordClassName && context.recordClassName && entry.recordClassName !== context.recordClassName) return false;
  if (entry.questionName && context.questionName && entry.questionName !== context.questionName) return false;
  return true;
}


// Default implementations
function defaultRender(state: any, dispatch: SimpleDispatch) {
  return null;
}

function defaultReduce(state: any, action: Action) {
  return state;
}

function defaultObserve(action$: Observable<Action>, services: any) {
  return empty() as Observable<Action>;
}
