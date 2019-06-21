import { constant } from 'lodash';
import { combineEpics, ActionsObservable, StateObservable } from 'redux-observable';
import { empty } from 'rxjs';
import {Action} from 'wdk-client/Actions';
import {mergeMap} from 'rxjs/operators';
import {fulfillDeleteStrategy, fulfillDuplicateStrategy} from 'wdk-client/Actions/StrategyActions';
import {RootState} from 'wdk-client/Core/State/Types';
import {EpicDependencies} from 'wdk-client/Core/Store';

// This store has no state, so we can just export a function that always returns null
export const reduce = constant(null);

export const observe = combineEpics(
  deleteStrategyEpic,
  duplicateStrategyEpic
);

function deleteStrategyEpic(action$: ActionsObservable<Action>, state$: StateObservable<RootState>, { transitioner }: EpicDependencies) {
  return action$.pipe(mergeMap(action => {
    if (fulfillDeleteStrategy.isOfType(action)) {
      transitioner.transitionToInternalPage('/workspace/strategies');
    }
    return empty();
  }))
}

function duplicateStrategyEpic(action$: ActionsObservable<Action>, state$: StateObservable<RootState>, { transitioner }: EpicDependencies) {
  return action$.pipe(mergeMap(action => {
    if (fulfillDuplicateStrategy.isOfType(action)) {
      const { strategyId } = action.payload;
      transitioner.transitionToInternalPage(`/workspace/strategies/${strategyId}`);
    }
    return empty();
  }))
}

// TODO Add notificationsEpic
