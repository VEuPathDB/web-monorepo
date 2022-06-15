import { defaultTo, difference, last, stubTrue, union, uniq } from 'lodash';
import { ActionsObservable, combineEpics, StateObservable } from 'redux-observable';
import { empty, merge, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Action } from 'wdk-client/Actions';
import { fulfillAddStepToBasket } from 'wdk-client/Actions/BasketActions';
import { fulfillImportStrategy } from 'wdk-client/Actions/ImportStrategyActions';
import { enqueueSnackbar } from 'wdk-client/Actions/NotificationActions';
import { fulfillPublicStrategies, fulfillPublicStrategiesError, requestPublicStrategies } from 'wdk-client/Actions/PublicStrategyActions';
import { transitionToInternalPage } from 'wdk-client/Actions/RouterActions';
import { cancelRequestDeleteOrRestoreStrategies, fulfillCreateStrategy, fulfillDeleteOrRestoreStrategies, fulfillDeleteStrategy, fulfillDraftStrategy, fulfillDuplicateStrategy, fulfillPatchStrategyProperties, fulfillPutStrategy, fulfillSaveAsStrategy, requestDeleteOrRestoreStrategies, requestDeleteStrategy, requestDuplicateStrategy } from 'wdk-client/Actions/StrategyActions';
import { fulfillStrategiesList, requestStrategiesList } from 'wdk-client/Actions/StrategyListActions';
import { addToOpenedStrategies, clearActiveModal, closeStrategyView, openStrategyView, removeFromOpenedStrategies, setActiveModal, setActiveStrategy, setOpenedStrategies, setOpenedStrategiesVisibility } from 'wdk-client/Actions/StrategyWorkspaceActions';
import { RootState } from 'wdk-client/Core/State/Types';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { getValue, preferences, setValue } from 'wdk-client/Preferences';
import { InferAction, mergeMapRequestActionsToEpic as mrate, switchMapRequestActionsToEpic as srate, takeEpicInWindow } from 'wdk-client/Utils/ActionCreatorUtils';
import { stateEffect } from 'wdk-client/Utils/ObserverUtils';
import { delay } from 'wdk-client/Utils/PromiseUtils';
import { diffSimilarStepTrees } from 'wdk-client/Utils/StrategyUtils';
import { StepTree, StrategyDetails, StrategySummary } from 'wdk-client/Utils/WdkUser';
import { enqueueAddStepToBasketNotificationAction, enqueueStrategyNotificationAction } from 'wdk-client/Views/Strategy/StrategyNotifications';

export const key = 'strategyWorkspace';

export interface State {
  activeStrategy?: {
    strategyId: number;
    stepId?: number;
  }
  activeModal?: { type: string, strategyId: number }
  isOpenedStrategiesVisible?: boolean;
  openedStrategies?: number[];
  strategySummaries?: StrategySummary[];
  strategySummariesLoading?: boolean;
  publicStrategySummaries?: StrategySummary[];
  publicStrategySummariesError?: boolean;
}

const initialState: State = {
}

export function reduce(state: State = initialState, action: Action): State {
  switch(action.type) {

    case openStrategyView.type:
      return {
        ...state,
        strategySummaries: undefined
      }

    case setActiveStrategy.type:
      return {
        ...state,
        activeStrategy: action.payload.activeStrategy
      }

    case fulfillSaveAsStrategy.type:
      return updateOpenedStrategies(state, openedStrategies =>
        openedStrategies
        .map(id => id === action.payload.oldStrategyId ? action.payload.newStrategyId : id));

    case fulfillDraftStrategy.type:
      return updateOpenedStrategies(state, openedStrategies =>
        openedStrategies
        .map(id => id === action.payload.savedStrategyId ? action.payload.strategy.strategyId : id));

    case fulfillDeleteStrategy.type:
      return updateOpenedStrategies(state, openedStrategies =>
        openedStrategies.filter(id => id !== action.payload.strategyId));

    case setActiveModal.type:
      return { ...state, activeModal: action.payload };

    case clearActiveModal.type:
      return { ...state, activeModal: undefined };

    case setOpenedStrategies.type: {
      const openedStrategies = action.payload.openedStrategies;
      const activeStrategy = state.activeStrategy == null || !openedStrategies.includes(state.activeStrategy.strategyId)
        ? undefined
        : state.activeStrategy;
      return {
        ...state,
        openedStrategies,
        activeStrategy
      }
    }

    case addToOpenedStrategies.type: {
      const openedStrategies = union(state.openedStrategies, action.payload.ids);
      const activeStrategyId = last(openedStrategies);
      const activeStrategy = activeStrategyId == null ? undefined : {
        strategyId: activeStrategyId
      };
      return {
        ...state,
        openedStrategies,
        activeStrategy
      }
    }

    case removeFromOpenedStrategies.type: {
      const openedStrategies = difference(state.openedStrategies, action.payload.ids);
      const activeStrategy = state.activeStrategy == null || !openedStrategies.includes(state.activeStrategy.strategyId)
        ? undefined
        : state.activeStrategy;
      return {
        ...state,
        openedStrategies,
        activeStrategy
      }
    }
    
    case setOpenedStrategiesVisibility.type:
      return {
        ...state,
        isOpenedStrategiesVisible: action.payload.isVisible
      }

    case requestDeleteStrategy.type:
    case requestDuplicateStrategy.type:
    case requestDeleteOrRestoreStrategies.type:
    case requestStrategiesList.type:
      return { ...state, strategySummariesLoading: true };

    case cancelRequestDeleteOrRestoreStrategies.type:
      return { ...state, strategySummariesLoading: false };

    case fulfillStrategiesList.type:
      return { ...state, strategySummaries: action.payload.strategies, strategySummariesLoading: false };

    case fulfillPublicStrategies.type:
      return { ...state, publicStrategySummaries: action.payload.publicStrategies }

    case fulfillPublicStrategiesError.type:
      return { ...state, publicStrategySummariesError: true };

    default:
      return state;
  }
}

function updateOpenedStrategies(state: State, updater: (openedStrategies: number[]) => number[]): State {
  return state.openedStrategies == null ? state : {
    ...state,
    openedStrategies: uniq(updater(state.openedStrategies))
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

    srate([openStrategyView], getOpenedStrategiesVisibility),
    srate([openStrategyView, fulfillStrategiesList], getOpenedStrategies),
    srate([openStrategyView], getRequestStrategiesList),
    srate([openStrategyView], getRequestPublicStrategies),

    mrate([fulfillCreateStrategy], getAddNotification),
    mrate([fulfillDeleteStrategy], getAddNotification),
    mrate([fulfillDuplicateStrategy], getAddNotification),
    mrate([fulfillPutStrategy], getAddNotification),
    mrate([fulfillPatchStrategyProperties], getAddNotification),

    srate([openStrategyView, fulfillCreateStrategy], getRequestStrategiesList,
      { areActionsNew: stubTrue }),
    srate([openStrategyView, fulfillDeleteStrategy], getRequestStrategiesList,
      { areActionsNew: stubTrue }),
    srate([openStrategyView, fulfillDeleteOrRestoreStrategies], getRequestStrategiesList,
      { areActionsNew: stubTrue }),
    srate([openStrategyView, fulfillDraftStrategy], getRequestStrategiesList,
      { areActionsNew: stubTrue }),
    srate([openStrategyView, fulfillDuplicateStrategy], getRequestStrategiesList,
      { areActionsNew: stubTrue }),
    srate([openStrategyView, fulfillSaveAsStrategy], getRequestStrategiesList,
      { areActionsNew: stubTrue }),
    srate([openStrategyView, fulfillImportStrategy], getRequestStrategiesList,
      { areActionsNew: stubTrue }),
    srate([openStrategyView, fulfillPutStrategy], getRequestStrategiesList,
      { areActionsNew: stubTrue }),
    srate([openStrategyView, fulfillPatchStrategyProperties], getRequestStrategiesList,
      { areActionsNew: stubTrue }),
    srate([fulfillAddStepToBasket], getAddStepToBasketNotification,
      { areActionsNew: stubTrue }),

    srate([openStrategyView, requestStrategiesList], getFulfillStrategiesList,
      { areActionsNew: stubTrue }),
    srate([openStrategyView, requestPublicStrategies], getFulfillPublicStrategies,
      { areActionsNew: stubTrue })
  )
);

// We are not using mrate for the next three epics since mrate does not currently allow its requestToFulfill function to return Promise<void>
// XXX Add a router store module to handle route update actions? Then we can convert these to mrates

function updateRouteOnStrategySteptreePutEpic(action$: ActionsObservable<Action>, state$: StateObservable<RootState>, { transitioner }: EpicDependencies): Observable<Action> {
  return action$.pipe(mergeMap(action => {
    if (fulfillPutStrategy.isOfType(action)) {
      // when the active srtrategies step tree is updated, select the root step only if the previous selection was the root before the update
      const { strategy } = action.payload;
      const { activeStrategy, openedStrategies } = state$.value[key];
      if (shouldMakeRootStepActive(strategy, activeStrategy, openedStrategies)) {
        transitioner.transitionToInternalPage(`/workspace/strategies/${strategy.strategyId}/${strategy.rootStepId}`, { replace: true });
      } else {
        const replaceStepRedirectMetadata = shouldMakeReplacedStepActive(
          strategy.strategyId,
          action.payload.oldStepTree,
          strategy.stepTree,
          openedStrategies
        );

        if (replaceStepRedirectMetadata.shouldRedirect) {
          transitioner.transitionToInternalPage(
            `/workspace/strategies/${strategy.strategyId}/${replaceStepRedirectMetadata.redirectTo}`, 
            { replace: true }
          );
        }
      }
    }
    return empty();
  }));
}

function shouldMakeRootStepActive(strategy: StrategyDetails, activeStrategy?: { strategyId: number, stepId?: number }, openedStrategies?: number[]): boolean {
  if (isStrategyClosed(strategy.strategyId, openedStrategies)) return false;
  if (activeStrategy == null) return true;
  if (activeStrategy.strategyId !== strategy.strategyId) return true;
  if (activeStrategy.stepId == null) return true;
  // single step strategy
  if (strategy.stepTree.primaryInput == null) return true;
  // previous root step is active
  if (strategy.stepTree.primaryInput.stepId === activeStrategy.stepId) return true;
  return false;
}

type ReplaceStepRedirectMetadata = 
  | { shouldRedirect: false } 
  | { shouldRedirect: true, redirectTo: number };

function shouldMakeReplacedStepActive(
  strategyId: number,
  oldStepTree: StepTree,
  newStepTree: StepTree,
  openedStrategies?: number[]
): ReplaceStepRedirectMetadata {
  const putRequestDiffResult = diffSimilarStepTrees(oldStepTree, newStepTree);

  return (
    !putRequestDiffResult.areSimilar ||
    putRequestDiffResult.diffs.length !== 1 ||
    isStrategyClosed(strategyId, openedStrategies)
  )
    ? { shouldRedirect: false }
    : { shouldRedirect: true, redirectTo: putRequestDiffResult.diffs[0].newStepId };
}

function isStrategyClosed(strategyId: number, openedStrategies?: number[]) {
  return !openedStrategies?.includes(strategyId)
}

function updateRouteOnStrategyDeleteEpic(action$: ActionsObservable<Action>, state$: StateObservable<RootState>, { transitioner }: EpicDependencies): Observable<Action> {
  return action$.pipe(mergeMap(action => {
    // Transition on request instead of fulfill to prevent a race between
    // changing route and removing deleted strategy from openedStrategies.
    if (requestDeleteStrategy.isOfType(action)) {
      const { strategyId } = action.payload;
      const { activeStrategy, openedStrategies = [] } = state$.value[key];
      if (activeStrategy != null && activeStrategy.strategyId === strategyId) {
        const nextOpenedStrategies = openedStrategies.filter(id => id !== strategyId)
        const nextActiveStrategy = last(nextOpenedStrategies);
        return of(transitionToInternalPage(`/workspace/strategies/${nextActiveStrategy == null ? 'all' : nextActiveStrategy}`));
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
    if (fulfillSaveAsStrategy.isOfType(action)) {
      const { activeStrategy } =  state$.value[key];
      if (activeStrategy && activeStrategy.strategyId === action.payload.oldStrategyId) {
        const { newStrategyId } = action.payload;
        transitioner.transitionToInternalPage(`/workspace/strategies/${newStrategyId}`, { replace: true });
      }
    }
    if (fulfillDraftStrategy.isOfType(action)) {
      const { activeStrategy } =  state$.value[key];
      if (activeStrategy && activeStrategy.strategyId === action.payload.savedStrategyId) {
        const { strategy: { strategyId, rootStepId } } = action.payload;
        transitioner.transitionToInternalPage(`/workspace/strategies/${strategyId}/${rootStepId}`, { replace: true });
      }
    }
    return empty();
  }))
}

function updatePreferencesEpic(action$: ActionsObservable<Action>, state$: StateObservable<RootState>, { wdkService }: EpicDependencies): Observable<Action> {
  return merge(
    stateEffect(
      state$,
      state => state[key].openedStrategies,
      openedStrategies => {
        setValue(wdkService, preferences.openedStrategies(), openedStrategies);
      }
    ),
    stateEffect(
      state$,
      state => state[key].isOpenedStrategiesVisible,
      isVisible => {
        setValue(wdkService, preferences.openedStrategiesVisibility(), isVisible);
      }
    )
  );
}


// mrate requestToFulfill

async function getOpenedStrategies(
  [openAction, stratListAction]: [InferAction<typeof openStrategyView>, InferAction<typeof fulfillStrategiesList>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof setOpenedStrategies>> {
  const allUserStrats = stratListAction.payload.strategies;
  const allUserStratIds = new Set(allUserStrats.map(strategy => strategy.strategyId));
  const openedStrategies = defaultTo(await getValue(wdkService, preferences.openedStrategies()), [] as number[])
    .filter(id => allUserStratIds.has(id));
  return setOpenedStrategies(openedStrategies);
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
  | typeof fulfillCreateStrategy
  | typeof fulfillPatchStrategyProperties>

async function getAddNotification(
  [action]: [NotifiableAction]
): Promise<ReturnType<typeof enqueueStrategyNotificationAction>> {
  return enqueueStrategyNotificationAction(
    `Your strategy has been ${mapActionToDisplayString(action)}.`,
    {
      key: `${action.type}-${Date.now()}`,
      persist: false,
    }
  );
}

async function getAddStepToBasketNotification(
  [action]: [InferAction<typeof fulfillAddStepToBasket>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof enqueueSnackbar>> {
  const step = action.payload.step;

  const recordClass = await wdkService.findRecordClass(step.recordClassName);

  return enqueueAddStepToBasketNotificationAction(
    step,
    recordClass
  );
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
    case fulfillPatchStrategyProperties.type:
      return 'updated';
  }
}

async function getRequestStrategiesList(
  [openAction, doesnotmatter]: [InferAction<typeof openStrategyView>] | [InferAction<typeof openStrategyView>, unknown],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof requestStrategiesList>> {
  return requestStrategiesList();
}

async function getFulfillStrategiesList(
  [openAction, requestStrategiesListAction]: [InferAction<typeof openStrategyView>, InferAction<typeof requestStrategiesList>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillStrategiesList>> {
  return fulfillStrategiesList(await wdkService.getStrategies());
}

async function getRequestPublicStrategies(
  [ openAction ]: [ InferAction<typeof openStrategyView> ],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof requestPublicStrategies>> {
  return requestPublicStrategies();
}

async function getFulfillPublicStrategies(
  [ openAction, requestPublicStrategiesAction ]: [ InferAction<typeof openStrategyView>, InferAction<typeof requestPublicStrategies> ],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillPublicStrategies | typeof fulfillPublicStrategiesError>> {
  try {
    return fulfillPublicStrategies(await wdkService.getPublicStrategies());
  }
  catch (error) {
    wdkService.submitErrorIfNot500(error);
    return fulfillPublicStrategiesError();
  }
}
