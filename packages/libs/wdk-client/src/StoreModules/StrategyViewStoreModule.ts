import { defaultTo } from 'lodash';
import { ActionsObservable, combineEpics, StateObservable } from 'redux-observable';
import { empty, Observable } from 'rxjs';
import { mergeMap, mergeMapTo, tap } from 'rxjs/operators';
import { Action } from 'wdk-client/Actions';
import { fulfillDeleteStrategy, fulfillDuplicateStrategy } from 'wdk-client/Actions/StrategyActions';
import { RootState } from 'wdk-client/Core/State/Types';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { openStrategyView, setOpenedStrategies, setOpenedStrategiesVisibility, setActiveStrategy } from 'wdk-client/Actions/StrategyViewActions';
import { getValue, preferences, setValue } from 'wdk-client/Preferences';
import { InferAction, switchMapRequestActionsToEpic } from 'wdk-client/Utils/ActionCreatorUtils';

export const key = 'strategyView';

export interface State {
  activeStrategy?: {
    strategyId: number;
    stepId?: number;
  }
  isOpenedStrategiesVisible?: boolean;
  openedStrategies?: number[];
}

const initialState: State = { }

export function reduce(state: State = initialState, action: Action): State {
  switch(action.type) {

    case setActiveStrategy.type:
      return {
        ...state,
        activeStrategy: action.payload.activeStrategy
      }

    case setOpenedStrategies.type:
      return {
        ...state,
        openedStrategies: action.payload.openedStrategies
      }

    case setOpenedStrategiesVisibility.type:
      return {
        ...state,
        isOpenedStrategiesVisible: action.payload.isVisible
      }

    default:
      return state;
  }
}

export const observe = combineEpics(
  deleteStrategyEpic,
  duplicateStrategyEpic,
  updatePreferencesEpic,
  switchMapRequestActionsToEpic([openStrategyView], getOpenedStrategiesVisibility),
  switchMapRequestActionsToEpic([setActiveStrategy], getOpenedStrategies),
);

// We are not using mrate for the next two epics since mrate does not currently allow its requestToFulfill function to return Promise<void>

function deleteStrategyEpic(action$: ActionsObservable<Action>, state$: StateObservable<RootState>, { transitioner }: EpicDependencies): Observable<Action> {
  return action$.pipe(mergeMap(action => {
    if (fulfillDeleteStrategy.isOfType(action)) {
      transitioner.transitionToInternalPage('/workspace/strategies');
    }
    return empty();
  }))
}

function duplicateStrategyEpic(action$: ActionsObservable<Action>, state$: StateObservable<RootState>, { transitioner }: EpicDependencies): Observable<Action> {
  return action$.pipe(mergeMap(action => {
    if (fulfillDuplicateStrategy.isOfType(action)) {
      const { strategyId } = action.payload;
      transitioner.transitionToInternalPage(`/workspace/strategies/${strategyId}`);
    }
    return empty();
  }))
}

function updatePreferencesEpic(action$: ActionsObservable<Action>, state$: StateObservable<RootState>, { wdkService }: EpicDependencies): Observable<Action> {
  return action$.pipe(
    tap(action => {
      switch(action.type) {
        case setOpenedStrategies.type:
          setValue(wdkService, preferences.openedStrategies(), action.payload.openedStrategies);
          break;
        case setOpenedStrategiesVisibility.type:
          setValue(wdkService, preferences.openedStrategiesVisibility(), action.payload.isVisible);
          break;
      }
    }),
    mergeMapTo(empty())
  );
}


// mrate requestToFulfill

async function getOpenedStrategies(
  [activeStrategyAction]: [InferAction<typeof setActiveStrategy>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof setOpenedStrategies>> {
  const strategyId = activeStrategyAction.payload.activeStrategy && activeStrategyAction.payload.activeStrategy.strategyId;
  const prevOpenedStrategies = defaultTo(await getValue(wdkService, preferences.openedStrategies()), [] as number[]);
  // TODO Filter out strategies not owned by current user
  const nextOpenedStrategies = strategyId == null || prevOpenedStrategies.includes(strategyId)
    ? prevOpenedStrategies
    : prevOpenedStrategies.concat(strategyId);
  if (prevOpenedStrategies !== nextOpenedStrategies) {
    await setValue(wdkService, preferences.openedStrategies(), nextOpenedStrategies);
  }
  return setOpenedStrategies(nextOpenedStrategies);
}

async function getOpenedStrategiesVisibility(
  [openAction]: [InferAction<typeof openStrategyView>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof setOpenedStrategiesVisibility>> {
  return setOpenedStrategiesVisibility(defaultTo(await getValue(wdkService, preferences.openedStrategiesVisibility()), false));
}

// TODO Add notificationsEpic
