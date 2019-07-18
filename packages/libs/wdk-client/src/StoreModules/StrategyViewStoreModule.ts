import { ActionsObservable, combineEpics, StateObservable } from 'redux-observable';
import { empty } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Action } from 'wdk-client/Actions';
import { fulfillDeleteStrategy, fulfillDuplicateStrategy } from 'wdk-client/Actions/StrategyActions';
import { RootState } from 'wdk-client/Core/State/Types';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { setOpenedStrategiesVisibility } from 'wdk-client/Actions/StrategyViewActions';

export const key = 'strategyView';

export interface State {
  isOpenedStrategiesVisible: boolean;
}

const initialState: State = {
  isOpenedStrategiesVisible: false
}

export function reduce(state: State = initialState, action: Action): State {
  switch(action.type) {
    case setOpenedStrategiesVisibility.type:
      return { ...state, isOpenedStrategiesVisible: action.payload.isVisible };
    default:
      return state;
  }
}

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
