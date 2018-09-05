import { filter, map, withLatestFrom } from 'rxjs/operators';

import WdkStore, { BaseState } from '../../Core/State/Stores/WdkStore';
import { Action, ActionObserver, ObserveServices } from '../../Utils/ActionCreatorUtils';
import { CompositeClientPlugin, PluginContext } from '../../Utils/ClientPlugin';

import * as Data from './BaseAttributeAnalysis';
import { ScopedAnalysisAction } from './BaseAttributeAnalysis/BaseAttributeAnalysisActions';
import { Observable } from 'rxjs';

export type State = BaseState & {
  analyses: Record<string, Data.State<string> | undefined>
};

export class AttributeAnalysisStore extends WdkStore<State> {

  getInitialState() {
    return {
      ...super.getInitialState(),
      analyses: {}
    }
  }

  handleAction(state: State, action: Action): State {
    if (!ScopedAnalysisAction.test(action)) return state;

    const { stepId, reporter, context } = action.payload;
    const key = stepId + '__' + reporter.name;
    return {
      ...state,
      analyses: {
        ...state.analyses,
        [key]: this.locatePlugin('attributeAnalysis').reduce(context, state.analyses[key], action.payload.action)
      }
    };
  }

  observeActions(action$: Observable<Action>, services: ObserveServices) {
    return scopePluginObserve(this.locatePlugin('attributeAnalysis').observe)(action$, services);
  }

}

function scopePluginObserve(observe: CompositeClientPlugin['observe']): ActionObserver<WdkStore> {
  return function scopedObserve(action$, services) {
    const scopedParentAction$ = action$.pipe(filter(ScopedAnalysisAction.test));
    const contextActionPair$ = scopedParentAction$.pipe(map(action => [ action.payload.context, action.payload.action ] as [PluginContext, Action]));
    const scopedChildAction$ = observe(contextActionPair$, services);
    return scopedChildAction$.pipe(
      withLatestFrom(scopedParentAction$, (child, parent) => ({ child, parent })),
      map(({ child, parent }) => {
        return { ...parent, payload: { ...parent.payload, action: child } }
      })
    );
  }
}