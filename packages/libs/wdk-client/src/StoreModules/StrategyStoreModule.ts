import { stubTrue, zip } from 'lodash/fp';
import { combineEpics, StateObservable, ActionsObservable } from 'redux-observable';

import { Action } from 'wdk-client/Actions';
import { enableSubmission, EnableSubmissionAction } from 'wdk-client/Actions/QuestionActions';
import { InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { RootState } from 'wdk-client/Core/State/Types';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { mergeMapRequestActionsToEpic as mrate } from 'wdk-client/Utils/ActionCreatorUtils';
import { StrategyDetails } from 'wdk-client/Utils/WdkUser';
import {
  requestCreateStrategy,
  fulfillCreateStrategy,
  requestDeleteOrRestoreStrategies,
  fulfillDeleteOrRestoreStrategies,
  requestDeleteStrategy,
  fulfillDeleteStrategy,
  requestDuplicateStrategy,
  fulfillDuplicateStrategy,
  requestStrategy,
  fulfillStrategy,
  fulfillPutStrategy,
  fulfillDraftStrategy,
  requestPatchStrategyProperties,
  requestPutStrategyStepTree,
  requestCreateStep,
  fulfillCreateStep,
  requestUpdateStepProperties,
  requestDeleteStep,
  requestUpdateStepSearchConfig,
  redirectToNewSearch,
  fulfillDeleteStep,
  requestRemoveStepFromStepTree,
  fulfillPatchStrategyProperties,
  requestReplaceStep,
  requestSaveAsStrategy,
  fulfillSaveAsStrategy,
} from 'wdk-client/Actions/StrategyActions';
import { removeStep, getStepIds, replaceStep, mapStepTreeIds } from 'wdk-client/Utils/StrategyUtils';
import { difference } from 'lodash';
import {confirm, alert} from 'wdk-client/Utils/Platform';
import {filter, mergeMap, mergeAll} from 'rxjs/operators';
import {empty, of, Observable} from 'rxjs';

export const key = 'strategies';

export interface StrategyEntry {
  isLoading: boolean;
  strategy?: StrategyDetails;
}

export type State = {
  strategies: Record<number, StrategyEntry|undefined>;
};

const initialState: State = {
  strategies: {}
};

export function reduce(state: State = initialState, action: Action): State {
  switch (action.type) {

  case requestStrategy.type:
  case requestPatchStrategyProperties.type:
  case requestPutStrategyStepTree.type:
  case requestDeleteStrategy.type:
  case requestUpdateStepProperties.type:
  case requestSaveAsStrategy.type:
  case requestDeleteStep.type:
  case requestRemoveStepFromStepTree.type:
  case requestUpdateStepSearchConfig.type:
  case requestReplaceStep.type: {
    const strategyId  = action.payload.strategyId;
    return updateStrategyEntry(state, strategyId, prevEntry => ({
      ...prevEntry,
      isLoading: true
    }));
  }

  case fulfillSaveAsStrategy.type: {
    return updateStrategyEntry(state, action.payload.oldStrategyId, {
      isLoading: false
    });
  }

  case fulfillDraftStrategy.type: {
    const newState = updateStrategyEntry(state, action.payload.savedStrategyId, {
      isLoading: false
    });
    return updateStrategyEntry(newState, action.payload.strategy.strategyId, {
      isLoading: false,
      strategy: action.payload.strategy
    });
  }

  // XXX Consider doing a deep compare of current and new strategy. Will have to determine which values to compare (e.g., omit step.{estimatedSize,lastRunTime})
  case fulfillStrategy.type: 
  case fulfillPutStrategy.type: {
    const strategy = action.payload.strategy;
    return updateStrategyEntry(state, strategy.strategyId, {
      isLoading: false,
      strategy
    });
  }

  case fulfillDeleteStrategy.type: {
    return deleteStrategiesFromState(state, [action.payload.strategyId]);
  }

  case fulfillDeleteOrRestoreStrategies.type: {
    return deleteStrategiesFromState(
      state,
      action.payload.deleteStrategiesSpecs
        .filter(spec => spec.isDeleted)
        .map(spec => spec.strategyId)
    );
  }

  default: {
      return state;
    }
  }
}

function updateStrategyEntry(
    state: State,
    strategyId: number,
    entry: StrategyEntry | ((prevEntry?: StrategyEntry) => StrategyEntry | undefined)
  ) {
    return {
      ...state,
      strategies: {
        ...state.strategies,
        [strategyId]: typeof entry === 'function' ? entry(state.strategies[strategyId]) : entry
      }
    };
  }

function deleteStrategiesFromState(state: State, strategyIds: number[]): State {
  if (strategyIds.length === 0) return state;
  const newStrategies = { ...state.strategies };
  for (const strategyId of strategyIds) {
    delete newStrategies[strategyId];
  }
  return {
    ...state,
    strategies: newStrategies
  }
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
  ): Promise<InferAction<typeof fulfillPutStrategy | typeof fulfillDraftStrategy>> {
    // XXX Should we delete steps that have been removed from the step tree?
    const { strategyId, newStepTree } = requestAction.payload;
    const strategy = await wdkService.getStrategy(strategyId);
    if (!strategy.isSaved) {
      await wdkService.putStrategyStepTree(strategyId, newStepTree);
      return fulfillPutStrategy(await wdkService.getStrategy(strategyId));
    }
    // Make duplicate strategy and apply changes to it
    const duplicateStrategyResponse = await wdkService.duplicateStrategy({ sourceStrategySignature: strategy.signature });
    const duplicateStrategy = await wdkService.getStrategy(duplicateStrategyResponse.id);
    const oldStepTree = getStepIds(strategy.stepTree);
    const duplicateStepTree = getStepIds(duplicateStrategy.stepTree);
    const stepMap = new Map<number, number>(zip(oldStepTree, duplicateStepTree) as [number, number][]);
    const translatedStepTree = mapStepTreeIds(newStepTree, id => stepMap.has(id) ? stepMap.get(id)! : id)
    await wdkService.putStrategyStepTree(duplicateStrategyResponse.id, translatedStepTree);
    return fulfillDraftStrategy(await wdkService.getStrategy(duplicateStrategyResponse.id), strategyId);
  }

  async function getFulfillDeleteOrRestoreStrategies(
    [requestAction]: [InferAction<typeof requestDeleteOrRestoreStrategies>],
    state$: StateObservable<RootState>,
    { wdkService }: EpicDependencies
  ): Promise<InferAction<typeof fulfillDeleteOrRestoreStrategies>> {
    const { deleteStrategiesSpecs, requestTimestamp } = requestAction.payload;
    await wdkService.deleteStrategies(deleteStrategiesSpecs);
    return fulfillDeleteOrRestoreStrategies(deleteStrategiesSpecs, requestTimestamp);
  }

// This logic is complicated to express with mrate, so we're using a vanilla Epic
function observePatchStrategy(action$: ActionsObservable<Action>, state$: StateObservable<RootState>, { wdkService }: EpicDependencies): Observable<Action> {
  return action$.pipe(
    filter(requestPatchStrategyProperties.isOfType),
    mergeMap(async action => {
      const { strategyId, strategyProperties }  = action.payload;

      // If updating name, make sure there are no name conflicts
      if (strategyProperties.name != null) {
        const allStrategies = await wdkService.getStrategies();
        const currentStrategy = allStrategies.find(strategy => strategy.strategyId === strategyId);
        if (currentStrategy == null) throw new Error("Could not find the target strategy.");
        const conflictingStrategy = allStrategies.find(strategy => (
          strategy.isSaved === currentStrategy.isSaved &&
          strategy.name === strategyProperties.name &&
          strategy.strategyId !== currentStrategy.strategyId
        ));
        if (conflictingStrategy) {
          await alert('Cannot update strategy', `A strategy with the name "${strategyProperties.name}" already exists.`)
          return empty();
        }
      }

      await wdkService.patchStrategyProperties(strategyId, strategyProperties);
      return of(fulfillPatchStrategyProperties(strategyId));
    }),
    mergeAll()
  );
}

// This logic is complicated to express with mrate, so we're using a vanilla Epic
function observeSaveStrategyAs(action$: ActionsObservable<Action>, state$: StateObservable<RootState>, { wdkService }: EpicDependencies): Observable<Action> {
  return action$.pipe(
    filter(requestSaveAsStrategy.isOfType),
    mergeMap(async action => {
      const { strategyId, targetName, options } = action.payload;
      const allStrategies = await wdkService.getStrategies();
      const sourceStrategy = allStrategies.find(s => s.strategyId === strategyId);

      if (sourceStrategy == null) throw new Error(`Could not find strategy being saved.`);

      const conflictingStrategy = allStrategies.find(strategy => (
        strategy.isSaved &&
        strategy.name === targetName &&
        strategy.strategyId !== strategyId
      ));

      const proceed = conflictingStrategy == null ? true : await confirm(
        'Replace existing strategy?',
        `A strategy with the name "${targetName}" already exists. Would you like to replace it?`
      );

      if (!proceed) return empty();

      const stepTree = await wdkService.getDuplicatedStrategyStepTree(strategyId);

      const { description } = sourceStrategy;

      // If there is a saved strategy with targetName, update it; otherwise create a new strategy.
      if (conflictingStrategy) {
        await wdkService.putStrategyStepTree(conflictingStrategy.strategyId, stepTree);
        await wdkService.patchStrategyProperties(conflictingStrategy.strategyId, { name: targetName, description });
        if (options.removeOrigin) await wdkService.deleteStrategy(strategyId);
        return of(fulfillSaveAsStrategy(strategyId, conflictingStrategy.strategyId));
      }

      const newStratResponse = await wdkService.createStrategy({ name: targetName, description, isSaved: true, isPublic: false, stepTree });
      if (options.removeOrigin) await wdkService.deleteStrategy(strategyId);
      return of(fulfillSaveAsStrategy(strategyId, newStratResponse.id));

    }),
    // The above operation results a Promise<Observable<T>>. `mergeAll` flattens that to Observable<T>.
    mergeAll()
  );
}

async function getFulfillStrategy_SaveAs(
  [saveAsAction]: [InferAction<typeof fulfillSaveAsStrategy>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillStrategy>> {
  return fulfillStrategy(await wdkService.getStrategy(saveAsAction.payload.newStrategyId));
}

  async function getFulfillStrategy_PatchStratProps(
    [requestAction]: [InferAction<typeof fulfillPatchStrategyProperties>],
    state$: StateObservable<RootState>,
    { wdkService }: EpicDependencies
  ): Promise<InferAction<typeof fulfillStrategy>> {
    const { strategyId }  = requestAction.payload;
    let strategy = await wdkService.getStrategy(strategyId);
    return fulfillStrategy(strategy);
  }

  function areFulfillStrategy_PatchStratPropsActionsCoherent(
    [requestAction]: [InferAction<typeof fulfillPatchStrategyProperties>],
    state: RootState
  ): boolean {
    return requestAction.payload.strategyId in state[key].strategies;
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
  ): Promise<InferAction<typeof fulfillStrategy | typeof fulfillDraftStrategy> | EnableSubmissionAction> {
    const {strategyId, stepId, searchConfig }  = requestAction.payload;
    const strategy = await wdkService.getStrategy(strategyId);
    if (strategy.isSaved) {
      // Make duplicate strategy and apply changes to it
      const { id: duplicateStrategyId } = await wdkService.duplicateStrategy({ sourceStrategySignature: strategy.signature });
      const duplicateStrategy = await wdkService.getStrategy(duplicateStrategyId);
      const oldStepIds = getStepIds(strategy.stepTree);
      const duplicateStepIds = getStepIds(duplicateStrategy.stepTree);
      const duplicateStepId = duplicateStepIds[oldStepIds.indexOf(stepId)];
      if (duplicateStepId == null) throw new Error("Could not revise step of draft strategy.");
      // Map answer param values to new step ids
      const { searchName } = duplicateStrategy.steps[duplicateStepId];
      const question = await wdkService.getQuestionAndParameters(searchName);
      const duplicateParameters = question.parameters.reduce((duplicateParameters, parameter) =>
        Object.assign(duplicateParameters, {
          [parameter.name]: parameter.type === 'input-step'
          ? String(duplicateStepIds[oldStepIds.indexOf(Number(searchConfig.parameters[parameter.name]))])
          : searchConfig.parameters[parameter.name]
        }), { ...searchConfig.parameters });
      const duplicateSearchConfig = { ...searchConfig, parameters: duplicateParameters };

      try {
        await wdkService.updateStepSearchConfig(duplicateStepId, duplicateSearchConfig);
        return fulfillDraftStrategy(await wdkService.getStrategy(duplicateStrategyId), strategyId);
      } catch (error) {
        // FIXME Instead of alerting, display the error(s) on the associated question form
        alert('A submission error occurred', String(error));
        return enableSubmission({ searchName });
      }
    }

    try {
      await wdkService.updateStepSearchConfig(stepId, searchConfig);
      return fulfillStrategy(await wdkService.getStrategy(strategyId));
    } catch (error) {
      // FIXME Instead of alerting, display the error(s) on the associated question form
      alert('A submission error occurred', String(error));
      return enableSubmission({ searchName: strategy.steps[stepId].searchName });
    }
  }

  async function getFulfillStrategy_ReplaceStep(
    [requestAction]: [InferAction<typeof requestReplaceStep>],
    state$: StateObservable<RootState>,
    { wdkService }: EpicDependencies
  ): Promise<InferAction<typeof requestPutStrategyStepTree> | EnableSubmissionAction> {
    const { strategyId, stepId: oldStepId, newStepSpec } = requestAction.payload;

    try {
      const { id: newStepId } = await wdkService.createStep(newStepSpec);
      const strategyEntry = state$.value.strategies.strategies[strategyId];

      if (strategyEntry == null || strategyEntry.isLoading || strategyEntry.strategy == null) {
        throw new Error(`Tried to replace strategy #${strategyId}, which is pending`);
      }

      const oldStepTree = strategyEntry.strategy.stepTree;

      return requestPutStrategyStepTree(
        strategyId,
        replaceStep(oldStepTree, oldStepId, newStepId)
      );
    } catch (error) {
      // FIXME Instead of alerting, display the error(s) on the associated question form
      alert('A submission error occurred', error);
      return enableSubmission({ searchName: newStepSpec.searchName });
    }
  }

  async function getFulfillStrategy_RemoveStepFromStepTree(
    [requestAction]: [InferAction<typeof requestRemoveStepFromStepTree>],
    state$: StateObservable<RootState>,
    { wdkService }: EpicDependencies
  ): Promise<InferAction<typeof requestPutStrategyStepTree | typeof requestDeleteStrategy>> {
    const { strategyId, stepIdToRemove, stepTree } = requestAction.payload;
    // First, we have to remove the step from the step tree, and then
    // we have to delete the step.
    const newStepTree = removeStep(stepTree, stepIdToRemove);
    return newStepTree ? requestPutStrategyStepTree(strategyId, newStepTree) : requestDeleteStrategy(strategyId);
    // const removedSteps = difference(
    //   getStepIds(stepTree),
    //   getStepIds(newStepTree)
    // )
    // await Promise.all(removedSteps.map(stepId => wdkService.deleteStep(stepId)));
    // const strategy = await wdkService.getStrategy(strategyId);
    // return fulfillStrategy(strategy);
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

// XXX This should probably go in the QuestionStoreModule
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
    mrate([requestDeleteOrRestoreStrategies], getFulfillDeleteOrRestoreStrategies),
    mrate([requestPutStrategyStepTree], getFulfillStrategy_PutStepTree), // replace saved with unsaved
    mrate([fulfillSaveAsStrategy], getFulfillStrategy_SaveAs,
      { areActionsNew: stubTrue }),
    mrate([fulfillPatchStrategyProperties], getFulfillStrategy_PatchStratProps,
      { areActionsNew: stubTrue,  areActionsCoherent: areFulfillStrategy_PatchStratPropsActionsCoherent }),
    mrate([requestUpdateStepProperties], getFulfillStrategy_PatchStepProps,
      { areActionsNew: stubTrue }),
    mrate([requestUpdateStepSearchConfig], getFulfillStrategy_PostStepSearchConfig, // replace saved with unsaved
      { areActionsNew: stubTrue }),
    mrate([requestReplaceStep], getFulfillStrategy_ReplaceStep,
      { areActionsNew: stubTrue }),
    mrate([requestRemoveStepFromStepTree], getFulfillStrategy_RemoveStepFromStepTree, // replace saved with unsaved
      { areActionsNew: stubTrue }),
    mrate([requestDeleteStep], getFulfillDeleteStep),
    mrate([requestCreateStrategy], getFulfillCreateStrategy),
    mrate([requestDeleteStrategy], getFulfillStrategyDelete),
    mrate([requestDuplicateStrategy], getFulfillDuplicateStrategy),
    mrate([requestCreateStep], getFulfillCreateStep),
    mrate([requestCreateStrategy, fulfillCreateStrategy], getFulfillNewSearch),
    observePatchStrategy,
    observeSaveStrategyAs
  );
