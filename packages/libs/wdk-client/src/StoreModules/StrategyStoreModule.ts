import { stubTrue } from 'lodash/fp';
import { combineEpics, StateObservable } from 'redux-observable';

import { Action } from 'wdk-client/Actions';
import { InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { RootState } from 'wdk-client/Core/State/Types';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { mergeMapRequestActionsToEpic as mrate } from 'wdk-client/Utils/ActionCreatorUtils';
import { StrategyDetails } from 'wdk-client/Utils/WdkUser';
import {
  requestCreateStrategy,
  fulfillCreateStrategy,
  requestDeleteStrategy,
  fulfillDeleteStrategy,
  requestDuplicateStrategy,
  fulfillDuplicateStrategy,
  requestStrategy,
  fulfillStrategy,
  requestPatchStrategyProperties,
  requestPutStrategyStepTree,
  requestCreateStep,
  fulfillCreateStep,
  requestUpdateStepProperties,
  requestDeleteStep,
  requestUpdateStepSearchConfig,
  openStrategy,
  closeStrategy,
  redirectToNewSearch,
  fulfillDeleteStep,
  requestRemoveStepFromStepTree,
} from 'wdk-client/Actions/StrategyActions';
import { removeStep, getStepIds } from 'wdk-client/Utils/StrategyUtils';
import { difference } from 'lodash';

export const key = 'strategies';

export type StrategyEntry =
  | { status: 'pending', isLoading: boolean }
  | { status: 'success', isLoading: boolean, strategy: StrategyDetails }

export type State = {
  strategies: Record<number, StrategyEntry|undefined>;
  openStrategies: number[];
};

const initialState: State = {
  strategies: {},
  openStrategies: []
};

function reqStrat(state: State, strategyId: number) {
  const entry = state.strategies[strategyId];
  if (entry != null) return state;
  return updateStrategyEntry(state, strategyId, prevEntry => ({
    status: 'pending',
    ...prevEntry,
    isLoading: true
  }));  
}

// TODO: why are the action variables "any" type?
export function reduce(state: State = initialState, action: Action): State {
  switch (action.type) {

  case requestStrategy.type:
  case requestPatchStrategyProperties.type:
  case requestPutStrategyStepTree.type:
  case requestDeleteStrategy.type:
  case requestPutStrategyStepTree.type:
  case requestUpdateStepProperties.type:
  case requestDeleteStep.type:  
  case requestUpdateStepSearchConfig.type:
    {
     const strategyId  = action.payload.strategyId;
     return reqStrat(state, strategyId);
   }

  case fulfillStrategy.type:{
    const strategy = action.payload.strategy;
    return updateStrategyEntry(state, strategy.strategyId, {
      status: 'success',
      isLoading: false,
      strategy
    });
  }

  case fulfillDeleteStrategy.type: {
    const strategyId = action.payload.strategyId;
    return {
      ...state,
      strategies: {
        [strategyId]: undefined
      }
    }
  }

  case openStrategy.type: {
    const strategyId = action.payload.strategyId;
    if (state.openStrategies.includes(strategyId)) return state;
    return {
      ...state,
      openStrategies: [...state.openStrategies, strategyId]
    }
  }

  case closeStrategy.type: {
    const strategyId = action.payload.strategyId;
    return {
      ...state,
      openStrategies: state.openStrategies.filter((stratId) => stratId != strategyId)
    }
  }

  default: {
      return state;
    }
  }
}

function updateStrategyEntry(
    state: State,
    strategyId: number,
    entry: StrategyEntry | ((prevEntry?: StrategyEntry) => StrategyEntry)
  ) {
    return {
      ...state,
      strategies: {
        ...state.strategies,
        [strategyId]: typeof entry === 'function' ? entry(state.strategies[strategyId]) : entry
      }
    };
  }

  async function getFulfillStrategy(
    [requestAction]: [InferAction<typeof requestStrategy>],
    state$: StateObservable<RootState>,
    { wdkService }: EpicDependencies
  ): Promise<InferAction<typeof fulfillStrategy>> {
    const strategyId  = requestAction.payload.strategyId;
      let strategy = await wdkService.getStrategy(strategyId);
      return fulfillStrategy(strategy);
  }

  async function getFulfillStrategy_PutStepTree(
    [requestAction]: [InferAction<typeof requestPutStrategyStepTree>],
    state$: StateObservable<RootState>,
    { wdkService }: EpicDependencies
  ): Promise<InferAction<typeof fulfillStrategy>> {
    const {strategyId, newStepTree }  = requestAction.payload;
    await wdkService.putStrategyStepTree(strategyId, newStepTree);
    let strategy = await wdkService.getStrategy(strategyId);
    return fulfillStrategy(strategy);
  }

  async function getFulfillStrategy_PatchStratProps(
    [requestAction]: [InferAction<typeof requestPatchStrategyProperties>],
    state$: StateObservable<RootState>,
    { wdkService }: EpicDependencies
  ): Promise<InferAction<typeof fulfillStrategy>> {
    const {strategyId, strategyProperties }  = requestAction.payload;
    await wdkService.patchStrategyProperties(strategyId, strategyProperties);
    let strategy = await wdkService.getStrategy(strategyId);
    return fulfillStrategy(strategy);
  }

  async function getFulfillStrategy_PatchStepProps(
    [requestAction]: [InferAction<typeof requestUpdateStepProperties>],
    state$: StateObservable<RootState>,
    { wdkService }: EpicDependencies
  ): Promise<InferAction<typeof fulfillStrategy>> {
    const { strategyId, stepId, stepSpec } = requestAction.payload;
    await wdkService.updateStepProperties(stepId, stepSpec);
    const strategy = await wdkService.getStrategy(strategyId);
    return fulfillStrategy(strategy);
  }

  // we read the strat back in to memory to facilitate undo of delete (i guess?)
  async function getFulfillStrategyDelete(
    [requestAction]: [InferAction<typeof requestDeleteStrategy>],
    state$: StateObservable<RootState>,
    { wdkService }: EpicDependencies
  ): Promise<InferAction<typeof fulfillDeleteStrategy>> {
    const {strategyId }  = requestAction.payload;
    await wdkService.deleteStrategy(strategyId);
    return fulfillDeleteStrategy(strategyId);
  }

  async function getFulfillStrategy_PostStepSearchConfig(
    [requestAction]: [InferAction<typeof requestUpdateStepSearchConfig>],
    state$: StateObservable<RootState>,
    { wdkService }: EpicDependencies
  ): Promise<InferAction<typeof fulfillStrategy>> {
    const {strategyId, stepId, searchConfig }  = requestAction.payload;
    await wdkService.updateStepSearchConfig(stepId, searchConfig);
    let strategy = await wdkService.getStrategy(strategyId);
    return fulfillStrategy(strategy);
  }

  async function getFulfillStrategy_RemoveStepFromStepTree(
    [requestAction]: [InferAction<typeof requestRemoveStepFromStepTree>],
    state$: StateObservable<RootState>,
    { wdkService }: EpicDependencies
  ): Promise<InferAction<typeof fulfillStrategy>> {
    const { strategyId, stepIdToRemove, stepTree } = requestAction.payload;
    // First, we have to remove the step from the step tree, and then
    // we have to delete the step.
    const newStepTree = removeStep(stepTree, stepIdToRemove);
    const removedSteps = difference(
      getStepIds(stepTree),
      getStepIds(newStepTree)
    )
    if (newStepTree) {
      await wdkService.putStrategyStepTree(strategyId, newStepTree);
    }
    else {
      await wdkService.deleteStrategy(strategyId);
    }
    await Promise.all(removedSteps.map(stepId => wdkService.deleteStep(stepId)));
    const strategy = await wdkService.getStrategy(strategyId);
    return fulfillStrategy(strategy);
  }

  async function getFulfillDeleteStep(
    [requestAction]: [InferAction<typeof requestDeleteStep>],
    state$: StateObservable<RootState>,
    { wdkService }: EpicDependencies
  ): Promise<InferAction<typeof fulfillDeleteStep>> {
    const { strategyId, stepId } = requestAction.payload;
    await wdkService.deleteStep(stepId);
    return fulfillDeleteStep(strategyId, stepId);
  }

  async function getFulfillDuplicateStrategy(
    [requestAction]: [InferAction<typeof requestDuplicateStrategy>],
    state$: StateObservable<RootState>,
    { wdkService }: EpicDependencies
  ): Promise<InferAction<typeof fulfillDuplicateStrategy>> {
    const {copyStepSpec, requestTimestamp }  = requestAction.payload;
      let strategy = await wdkService.duplicateStrategy(copyStepSpec);
      return fulfillDuplicateStrategy(strategy.id, requestTimestamp);
  }

  async function getFulfillCreateStrategy(
    [requestAction]: [InferAction<typeof requestCreateStrategy>],
    state$: StateObservable<RootState>,
    { wdkService }: EpicDependencies
  ): Promise<InferAction<typeof fulfillCreateStrategy>> {
    const { newStrategySpec, requestTimestamp } = requestAction.payload;
    let identifier = await wdkService.createStrategy(newStrategySpec);
  
    return fulfillCreateStrategy(identifier.id, requestTimestamp);
  }

  
async function getFulfillCreateStep(
  [requestAction]: [InferAction<typeof requestCreateStep>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillCreateStep>> {
  const { newStepSpec, requestTimestamp } = requestAction.payload;
  let identifier = await wdkService.createStep(newStepSpec);

  return fulfillCreateStep(identifier.id, requestTimestamp);
}

async function getFulfillNewSearch(
  [requestStrategyAction, fulfillCreateStrategyAction]: [InferAction<typeof requestCreateStrategy>, InferAction<typeof fulfillCreateStrategy>],
  state$: StateObservable<RootState>,
  { transitioner }: EpicDependencies
): Promise<InferAction<typeof redirectToNewSearch>> {
  const newStrategyId = fulfillCreateStrategyAction.payload.strategyId;
  const newStepId = requestStrategyAction.payload.newStrategySpec.stepTree.stepId;

  setTimeout(() => {
    transitioner.transitionToInternalPage(
      `/workspace/strategies/${newStrategyId}/${newStepId}`
    )
  }, 0);

  return redirectToNewSearch(newStrategyId, newStepId);
}
  
  export const observe = combineEpics(
    mrate([requestStrategy], getFulfillStrategy, {
      areActionsNew: stubTrue
    }),
    mrate([requestPutStrategyStepTree], getFulfillStrategy_PutStepTree),
    mrate([requestPatchStrategyProperties], getFulfillStrategy_PatchStratProps),
    mrate([requestUpdateStepProperties], getFulfillStrategy_PatchStepProps),
    mrate([requestUpdateStepSearchConfig], getFulfillStrategy_PostStepSearchConfig),
    mrate([requestRemoveStepFromStepTree], getFulfillStrategy_RemoveStepFromStepTree),
    mrate([requestDeleteStep], getFulfillDeleteStep),
    mrate([requestCreateStrategy], getFulfillCreateStrategy),
    mrate([requestDeleteStrategy], getFulfillStrategyDelete),
    mrate([requestDuplicateStrategy], getFulfillDuplicateStrategy),
    mrate([requestCreateStep], getFulfillCreateStep),
    mrate([requestCreateStrategy, fulfillCreateStrategy], getFulfillNewSearch)
  );
/*
requestUpdateStepProperties,
requestDeleteStep,
*/