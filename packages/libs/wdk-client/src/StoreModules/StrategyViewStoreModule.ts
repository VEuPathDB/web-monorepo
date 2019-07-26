import { defaultTo } from 'lodash';
import { ActionsObservable, combineEpics, StateObservable } from 'redux-observable';
import { empty, Observable, of } from 'rxjs';
import { mergeMap, mergeMapTo, tap } from 'rxjs/operators';
import { Action } from 'wdk-client/Actions';
import { fulfillDeleteStrategy, fulfillDuplicateStrategy, fulfillPutStrategy, fulfillCreateStrategy } from 'wdk-client/Actions/StrategyActions';
import { RootState } from 'wdk-client/Core/State/Types';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { openStrategyView, setOpenedStrategies, setOpenedStrategiesVisibility, setActiveStrategy, addNotification, removeNotification, closeStrategyView } from 'wdk-client/Actions/StrategyViewActions';
import { getValue, preferences, setValue } from 'wdk-client/Preferences';
import { InferAction, switchMapRequestActionsToEpic, mergeMapRequestActionsToEpic, takeEpicInWindow } from 'wdk-client/Utils/ActionCreatorUtils';
import { delay } from 'wdk-client/Utils/PromiseUtils';
import {StrategyDetails} from 'wdk-client/Utils/WdkUser';

export const key = 'strategyView';

export interface State {
  activeStrategy?: {
    strategyId: number;
    stepId?: number;
  }
  isOpenedStrategiesVisible?: boolean;
  openedStrategies?: number[];
  notifications: Record<string, string | undefined>;
}

const initialState: State = {
  notifications: {}
}

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

    case addNotification.type:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          [action.payload.id]: action.payload.message
        }
      };

    case removeNotification.type:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          [action.payload.id]: undefined
        }
      }

    default:
      return state;
  }
}

export const observe = takeEpicInWindow(
  {
    startActionCreator: openStrategyView,
    endActionCreator: closeStrategyView
  },
  combineEpics(
    updateRouteOnStrategySteptreePutEpic,
    updateRouteOnStrategyDeleteEpic,
    updateRouteOnStrategyDuplicateEpic,
    updatePreferencesEpic,
    switchMapRequestActionsToEpic([openStrategyView], getOpenedStrategiesVisibility),
    switchMapRequestActionsToEpic([setActiveStrategy], getOpenedStrategies),
    mergeMapRequestActionsToEpic([fulfillCreateStrategy], getAddNotification),
    mergeMapRequestActionsToEpic([fulfillDeleteStrategy], getAddNotification),
    mergeMapRequestActionsToEpic([fulfillDuplicateStrategy], getAddNotification),
    mergeMapRequestActionsToEpic([fulfillPutStrategy], getAddNotification),
    mergeMapRequestActionsToEpic([addNotification], getRemoveNotification)
  )
);

// We are not using mrate for the next three epics since mrate does not currently allow its requestToFulfill function to return Promise<void>
// XXX Add a router store module to handle route update actions? Then we can convert these to mrates

function updateRouteOnStrategySteptreePutEpic(action$: ActionsObservable<Action>, state$: StateObservable<RootState>, { transitioner }: EpicDependencies): Observable<Action> {
  return action$.pipe(mergeMap(action => {
    if (fulfillPutStrategy.isOfType(action)) {
      // when the active srtrategies step tree is updated, select the root state only if the previous selection was the root before the update
      const { strategy } = action.payload;
      const { activeStrategy } = state$.value[key];
      if (shouldMakeRootStepActive(strategy, activeStrategy)) {
        transitioner.transitionToInternalPage(`/workspace/strategies/${strategy.strategyId}/${strategy.rootStepId}`, { replace: true });
      }
    }
    return empty();
  }));
}

function shouldMakeRootStepActive(strategy: StrategyDetails, activeStrategy?: { strategyId: number, stepId?: number }): boolean {
  if (activeStrategy == null) return true;
  if (activeStrategy.strategyId !== strategy.strategyId) return false;
  if (activeStrategy.stepId == null) return true;
  // single step strategy
  if (strategy.stepTree.primaryInput == null) return true;
  // previous root step is active
  if (strategy.stepTree.primaryInput.stepId === activeStrategy.stepId) return true;
  return false;
}

function updateRouteOnStrategyDeleteEpic(action$: ActionsObservable<Action>, state$: StateObservable<RootState>, { transitioner }: EpicDependencies): Observable<Action> {
  return action$.pipe(mergeMap(action => {
    if (fulfillDeleteStrategy.isOfType(action)) {
      const { strategyId } = action.payload;
      const { activeStrategy, openedStrategies = [] } = state$.value[key];
      const nextOpenedStrategies = openedStrategies.includes(strategyId)
        ? openedStrategies.filter(id => id !== strategyId)
        : openedStrategies;
      if (activeStrategy != null && activeStrategy.strategyId === strategyId) {
        // We could also go to the first opened strategy by inspecting openedStrategies
        transitioner.transitionToInternalPage('/workspace/strategies', { replace: true });
      }
      if (nextOpenedStrategies !== openedStrategies) {
        return of(setOpenedStrategies(nextOpenedStrategies));
      }
    }
    return empty();
  }))
}

function updateRouteOnStrategyDuplicateEpic(action$: ActionsObservable<Action>, state$: StateObservable<RootState>, { transitioner }: EpicDependencies): Observable<Action> {
  return action$.pipe(mergeMap(action => {
    if (fulfillDuplicateStrategy.isOfType(action)) {
      const { strategyId } = action.payload;
      transitioner.transitionToInternalPage(`/workspace/strategies/${strategyId}`, { replace: true });
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
  const allUserStrats = await wdkService.getStrategies();
  const allUserStratIds = new Set(allUserStrats.map(strategy => strategy.strategyId));
  const prevOpenedStrategies = defaultTo(await getValue(wdkService, preferences.openedStrategies()), [] as number[])
    // Filter out strategies not owned by current user
    .filter(id => allUserStratIds.has(id));
  const nextOpenedStrategies = strategyId == null || !allUserStratIds.has(strategyId) || prevOpenedStrategies.includes(strategyId)
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

type NotifiableAction =
  | InferAction<typeof fulfillDeleteStrategy
  | typeof fulfillDuplicateStrategy
  | typeof fulfillPutStrategy
  | typeof fulfillCreateStrategy>

async function getAddNotification(
  [action]: [NotifiableAction]
): Promise<InferAction<typeof addNotification>> {
  return addNotification(`Your strategy has been ${mapActionToDisplayString(action)}.`);
}

function mapActionToDisplayString(action: NotifiableAction): string {
  switch(action.type) {
    case fulfillCreateStrategy.type:
      return 'created';
    case fulfillDeleteStrategy.type:
      return 'deleted';
    case fulfillDuplicateStrategy.type:
      return 'duplicated';
    case fulfillPutStrategy.type:
      return 'updated';
  }
}

const NOTIFICATION_DURATION_MS = 5000;

async function getRemoveNotification(
  [addAction]: [InferAction<typeof addNotification>]
): Promise<InferAction<typeof removeNotification>> {
  const { id } = addAction.payload;
  await delay(NOTIFICATION_DURATION_MS);
  return removeNotification(id);
}
