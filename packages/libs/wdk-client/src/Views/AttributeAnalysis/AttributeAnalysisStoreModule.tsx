import { filter, map, withLatestFrom } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { Action } from '../../Utils/ActionCreatorUtils';
import { CompositeClientPlugin, PluginContext } from '../../Utils/ClientPlugin';

import * as Data from './BaseAttributeAnalysis';
import { ScopedAnalysisAction } from './BaseAttributeAnalysis/BaseAttributeAnalysisActions';
import { LocatePlugin } from '../../Core/CommonTypes';
import { EpicDependencies } from '../../Core/Store';

export type State = {
  analyses: Record<string, Data.State<string> | undefined>
};

const initialState = {
  analyses: {}
};

export const key = 'attributeAnalysis';

export function reduce(state: State = initialState, action: Action, locatePlugin: LocatePlugin) {
  if (!ScopedAnalysisAction.test(action)) {
    return state;
  }

  const { stepId, reporter, context } = action.payload;
  const key = stepId + '__' + reporter.name;
  return {
    ...state,
    analyses: {
      ...state.analyses,
      [key]: locatePlugin('attributeAnalysis').reduce(context, state.analyses[key], action.payload.action)
    }
  };
}

export function observe(action$: Observable<Action>, state$: Observable<any>, dependencies: EpicDependencies) {
  const attributeAnalysisState$ = state$.pipe(
    map(state => state[key])
  );

  return scopePluginObserve(dependencies.locatePlugin('attributeAnalysis').observe)(action$, attributeAnalysisState$, dependencies);
}

function scopePluginObserve(observe: CompositeClientPlugin['observe']) {
  return function scopedObserve(action$: Observable<Action>, state$: Observable<State>, dependencies: EpicDependencies) {
    const scopedParentAction$ = action$.pipe(filter(ScopedAnalysisAction.test));
    const contextActionPair$ = scopedParentAction$.pipe(map(action => [ action.payload.context, action.payload.action ] as [PluginContext, Action]));
    const scopedChildAction$ = observe(contextActionPair$, state$, dependencies);
    
    return scopedChildAction$.pipe(
      withLatestFrom(scopedParentAction$, (child, parent) => ({ child, parent })),
      map(({ child, parent }) => {
        return { ...parent, payload: { ...parent.payload, action: child } }
      })
    );
  };
}
