import { stubTrue, zip } from 'lodash/fp';
import { combineEpics, StateObservable } from 'redux-observable';

import { Action } from '../Actions';
import {
  reportSubmissionError,
  EnableSubmissionAction,
} from '../Actions/QuestionActions';
import { InferAction } from '../Utils/ActionCreatorUtils';
import { WdkService } from '../Core';
import { RootState } from '../Core/State/Types';
import { EpicDependencies } from '../Core/Store';
import { mergeMapRequestActionsToEpic as mrate } from '../Utils/ActionCreatorUtils';
import { PatchStepSpec, StrategyDetails } from '../Utils/WdkUser';
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
  fulfillStrategyError,
  fulfillPutStrategy,
  fulfillDraftStrategy,
  requestPatchStrategyProperties,
  requestPutStrategyStepTree,
  requestCreateStep,
  fulfillCreateStep,
  requestUpdateStepProperties,
  requestDeleteStep,
  requestUpdateStepSearchConfig,
  fulfillDeleteStep,
  requestRemoveStepFromStepTree,
  fulfillPatchStrategyProperties,
  requestReplaceStep,
  requestSaveAsStrategy,
  fulfillSaveAsStrategy,
  cancelStrategyRequest,
  cancelRequestDeleteOrRestoreStrategies as cancelDeleteOrRestoreStrategies,
  requestCombineWithBasket,
  requestCombineWithStrategy,
  requestReviseStep,
} from '../Actions/StrategyActions';
import { fulfillBasketStrategy } from '../Actions/BasketActions';
import { fulfillImportStrategy } from '../Actions/ImportStrategyActions';
import {
  removeStep,
  getStepIds,
  replaceStep,
  mapStepTreeIds,
  addStep,
} from '../Utils/StrategyUtils';
import { confirm, alert } from '../Utils/Platform';
import { SearchConfig } from '../Utils/WdkModel';

export const key = 'strategies';

export interface StrategyEntry {
  isLoading: boolean;
  hasError: boolean;
  strategy?: StrategyDetails;
}

export type State = {
  strategies: Record<number, StrategyEntry | undefined>;
};

const initialState: State = {
  strategies: {},
};

export function reduce(state: State = initialState, action: Action): State {
  switch (action.type) {
    case requestStrategy.type:
    case requestPatchStrategyProperties.type:
    case requestPutStrategyStepTree.type:
    case requestDeleteStrategy.type:
    case requestDuplicateStrategy.type:
    case requestUpdateStepProperties.type:
    case requestSaveAsStrategy.type:
    case requestDeleteStep.type:
    case requestRemoveStepFromStepTree.type:
    case requestUpdateStepSearchConfig.type:
    case requestReplaceStep.type:
    case requestCombineWithBasket.type:
    case requestCombineWithStrategy.type:
    case requestReviseStep.type: {
      const strategyId = action.payload.strategyId;
      return updateStrategyEntry(state, strategyId, (prevEntry) => ({
        ...prevEntry,
        isLoading: true,
        hasError: false,
      }));
    }

    case cancelStrategyRequest.type: {
      return updateStrategyEntry(state, action.payload.strategyId, (entry) => ({
        hasError: false,
        ...entry,
        isLoading: false,
      }));
    }

    case fulfillDuplicateStrategy.type: {
      const s1 = updateStrategyEntry(
        state,
        action.payload.sourceStrategyId,
        (entry) => ({
          hasError: false,
          ...entry,
          isLoading: false,
        })
      );
      const s2 = updateStrategyEntry(s1, action.payload.strategyId, {
        hasError: false,
        isLoading: false,
      });

      return s2;
    }

    case fulfillSaveAsStrategy.type: {
      // remove the new saved strategy from state, if it is there, since it will be out-of-date.
      const s1 = deleteStrategiesFromState(state, [
        action.payload.newStrategyId,
      ]);
      const s2 = updateStrategyEntry(s1, action.payload.oldStrategyId, {
        isLoading: false,
        hasError: false,
      });
      return s2;
    }

    case fulfillDraftStrategy.type: {
      const newState = updateStrategyEntry(
        state,
        action.payload.savedStrategyId,
        {
          isLoading: false,
          hasError: false,
        }
      );
      return updateStrategyEntry(newState, action.payload.strategy.strategyId, {
        isLoading: false,
        hasError: false,
        strategy: action.payload.strategy,
      });
    }

    case fulfillCreateStrategy.type:
    case fulfillBasketStrategy.type:
    case fulfillImportStrategy.type: {
      return updateStrategyEntry(state, action.payload.strategyId, {
        hasError: false,
        isLoading: false,
      });
    }

    // XXX Consider doing a deep compare of current and new strategy. Will have to determine which values to compare (e.g., omit step.{estimatedSize,lastRunTime})
    case fulfillStrategy.type:
    case fulfillPutStrategy.type: {
      const strategy = action.payload.strategy;
      return updateStrategyEntry(state, strategy.strategyId, {
        isLoading: false,
        hasError: false,
        strategy,
      });
    }

    case fulfillStrategyError.type: {
      return updateStrategyEntry(state, action.payload.strategyId, (entry) => ({
        ...entry,
        isLoading: false,
        hasError: true,
      }));
    }

    case fulfillDeleteStrategy.type: {
      return deleteStrategiesFromState(state, [action.payload.strategyId]);
    }

    case fulfillDeleteOrRestoreStrategies.type: {
      return deleteStrategiesFromState(
        state,
        action.payload.deleteStrategiesSpecs
          .filter((spec) => spec.isDeleted)
          .map((spec) => spec.strategyId)
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
  entry:
    | StrategyEntry
    | ((prevEntry?: StrategyEntry) => StrategyEntry | undefined)
) {
  return {
    ...state,
    strategies: {
      ...state.strategies,
      [strategyId]:
        typeof entry === 'function'
          ? entry(state.strategies[strategyId])
          : entry,
    },
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
    strategies: newStrategies,
  };
}

async function getFulfillStrategy(
  [requestAction]: [InferAction<typeof requestStrategy>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillStrategy | typeof fulfillStrategyError>> {
  const strategyId = requestAction.payload.strategyId;
  try {
    const strategy = await wdkService.getStrategy(strategyId);
    return fulfillStrategy(strategy);
  } catch (error) {
    return fulfillStrategyError(strategyId, error);
  }
}

async function getFulfillStrategy_PutStepTree(
  [requestAction]: [InferAction<typeof requestPutStrategyStepTree>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<
  InferAction<typeof fulfillPutStrategy | typeof fulfillDraftStrategy>
> {
  // XXX Should we delete steps that have been removed from the step tree?
  const { strategyId, newStepTree } = requestAction.payload;
  const strategy = await wdkService.getStrategy(strategyId);
  if (!strategy.isSaved) {
    const oldStepTree = strategy.stepTree;
    await wdkService.putStrategyStepTree(strategyId, newStepTree);
    return fulfillPutStrategy(
      await wdkService.getStrategy(strategyId),
      oldStepTree
    );
  }
  // Make duplicate strategy and apply changes to it
  const duplicateStrategyResponse = await wdkService.duplicateStrategy({
    sourceStrategySignature: strategy.signature,
  });
  const duplicateStrategy = await wdkService.getStrategy(
    duplicateStrategyResponse.id
  );
  const oldStepTree = getStepIds(strategy.stepTree);
  const duplicateStepTree = getStepIds(duplicateStrategy.stepTree);
  const stepMap = new Map<number, number>(
    zip(oldStepTree, duplicateStepTree) as [number, number][]
  );
  const translatedStepTree = mapStepTreeIds(newStepTree, (id) =>
    stepMap.has(id) ? stepMap.get(id)! : id
  );
  await wdkService.putStrategyStepTree(
    duplicateStrategyResponse.id,
    translatedStepTree
  );
  return fulfillDraftStrategy(
    await wdkService.getStrategy(duplicateStrategyResponse.id),
    strategyId
  );
}

async function getFulfillDeleteOrRestoreStrategies(
  [requestAction]: [InferAction<typeof requestDeleteOrRestoreStrategies>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<
  InferAction<
    | typeof fulfillDeleteOrRestoreStrategies
    | typeof cancelDeleteOrRestoreStrategies
  >
> {
  const { deleteStrategiesSpecs, requestTimestamp } = requestAction.payload;
  const numberToDelete = deleteStrategiesSpecs.filter(
    (s) => s.isDeleted
  ).length;
  if (
    numberToDelete === 0 ||
    (await confirm(
      'Delete strategies?',
      `Are you sure you want to delete ${numberToDelete} strategies?`
    ))
  ) {
    await wdkService.deleteStrategies(deleteStrategiesSpecs);
    return fulfillDeleteOrRestoreStrategies(
      deleteStrategiesSpecs,
      requestTimestamp
    );
  } else {
    return cancelDeleteOrRestoreStrategies(
      deleteStrategiesSpecs,
      requestTimestamp
    );
  }
}

async function getFulfillPatchStrategy(
  [requestAction]: [InferAction<typeof requestPatchStrategyProperties>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<
  InferAction<
    typeof fulfillPatchStrategyProperties | typeof cancelStrategyRequest
  >
> {
  const { strategyId, strategyProperties } = requestAction.payload;

  // If updating name, make sure there are no name conflicts
  if (strategyProperties.name != null) {
    const allStrategies = await wdkService.getStrategies();
    const currentStrategy = allStrategies.find(
      (strategy) => strategy.strategyId === strategyId
    );
    if (currentStrategy == null)
      throw new Error('Could not find the target strategy.');
    const conflictingStrategy = currentStrategy.isSaved
      ? allStrategies.find(
          (strategy) =>
            strategy.isSaved === currentStrategy.isSaved &&
            strategy.name === strategyProperties.name &&
            strategy.strategyId !== currentStrategy.strategyId
        )
      : undefined;
    if (conflictingStrategy) {
      await alert(
        'Cannot update strategy',
        `A strategy with the name "${strategyProperties.name}" already exists.`
      );
      return cancelStrategyRequest(strategyId);
    }
  }

  await wdkService.patchStrategyProperties(strategyId, strategyProperties);
  return fulfillPatchStrategyProperties(strategyId);
}

async function getFulfilllSaveAs(
  [requestAction]: [InferAction<typeof requestSaveAsStrategy>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<
  InferAction<typeof fulfillSaveAsStrategy | typeof cancelStrategyRequest>
> {
  const { strategyId, targetName, options } = requestAction.payload;
  const allStrategies = await wdkService.getStrategies();
  const sourceStrategy = allStrategies.find((s) => s.strategyId === strategyId);

  if (sourceStrategy == null)
    throw new Error(`Could not find strategy being saved.`);

  const conflictingStrategy = allStrategies.find(
    (strategy) =>
      strategy.isSaved &&
      strategy.name === targetName &&
      strategy.strategyId !== strategyId
  );

  const proceed =
    conflictingStrategy == null
      ? true
      : await confirm(
          'Replace existing strategy?',
          `A strategy with the name "${targetName}" already exists. Would you like to replace it?`
        );

  if (!proceed) return cancelStrategyRequest(strategyId);

  // If there is a saved strategy with targetName, update it based on the unsaved strategy; otherwise update the unsaved strategy.
  if (conflictingStrategy) {
    await wdkService.patchStrategyProperties(conflictingStrategy.strategyId, {
      overwriteWith: strategyId,
      name: targetName,
    });
    if (options.removeOrigin) await wdkService.deleteStrategy(strategyId);
    return fulfillSaveAsStrategy(strategyId, conflictingStrategy.strategyId);
  }

  await wdkService.patchStrategyProperties(strategyId, {
    name: targetName,
    isSaved: true,
  });
  return fulfillSaveAsStrategy(strategyId, strategyId);
}

async function getFulfillStrategy_SaveAs(
  [saveAsAction]: [InferAction<typeof fulfillSaveAsStrategy>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillStrategy>> {
  return fulfillStrategy(
    await wdkService.getStrategy(saveAsAction.payload.newStrategyId)
  );
}

async function getFulfillStrategy_PatchStratProps(
  [requestAction]: [InferAction<typeof fulfillPatchStrategyProperties>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillStrategy>> {
  const { strategyId } = requestAction.payload;
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
  const { strategyId } = requestAction.payload;
  await wdkService.deleteStrategy(strategyId);
  return fulfillDeleteStrategy(strategyId);
}

async function getFulfillStrategy_PostStepSearchConfig(
  [requestAction]: [InferAction<typeof requestUpdateStepSearchConfig>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<
  | InferAction<typeof fulfillStrategy | typeof fulfillDraftStrategy>
  | EnableSubmissionAction
> {
  const { strategyId, stepId, searchConfig } = requestAction.payload;
  return updateStepPropertiesAndSearchConfig(
    wdkService,
    strategyId,
    stepId,
    undefined,
    searchConfig
  );
}

async function getFulfillStrategy_ReviseStep(
  [requestAction]: [InferAction<typeof requestReviseStep>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<
  | InferAction<typeof fulfillStrategy | typeof fulfillDraftStrategy>
  | EnableSubmissionAction
> {
  const { strategyId, stepId, stepSpec, searchConfig } = requestAction.payload;
  return updateStepPropertiesAndSearchConfig(
    wdkService,
    strategyId,
    stepId,
    stepSpec,
    searchConfig
  );
}

async function getFulfillStrategy_ReplaceStep(
  [requestAction]: [InferAction<typeof requestReplaceStep>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<
  InferAction<typeof requestPutStrategyStepTree> | EnableSubmissionAction
> {
  const { strategyId, stepId: oldStepId, newStepSpec } = requestAction.payload;

  try {
    const { id: newStepId } = await wdkService.createStep(newStepSpec);
    const strategyEntry = state$.value.strategies.strategies[strategyId];

    if (strategyEntry == null || strategyEntry.strategy == null) {
      throw new Error(
        `Tried to replace strategy #${strategyId}, which is pending`
      );
    }

    const oldStepTree = strategyEntry.strategy.stepTree;

    return requestPutStrategyStepTree(
      strategyId,
      replaceStep(oldStepTree, oldStepId, newStepId)
    );
  } catch (error) {
    return reportSubmissionError(newStepSpec.searchName, error, wdkService);
  }
}

async function getFulfillStrategy_RemoveStepFromStepTree(
  [requestAction]: [InferAction<typeof requestRemoveStepFromStepTree>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<
  InferAction<typeof requestPutStrategyStepTree | typeof requestDeleteStrategy>
> {
  const { strategyId, stepIdToRemove, stepTree, deleteSubtree } =
    requestAction.payload;
  // First, we have to remove the step from the step tree, and then
  // we have to delete the step.
  const newStepTree = removeStep(stepTree, stepIdToRemove, deleteSubtree);
  return newStepTree
    ? requestPutStrategyStepTree(strategyId, newStepTree)
    : requestDeleteStrategy(strategyId);
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
  const { strategyId, requestTimestamp } = requestAction.payload;
  const currentStrategy = await wdkService.getStrategy(strategyId);
  const stepTree = await wdkService.getDuplicatedStrategyStepTree(strategyId);
  const { name, description } = currentStrategy;
  const strategy = await wdkService.createStrategy({
    isSaved: false,
    isPublic: false,
    name: `${name}, Copy of`,
    description,
    stepTree,
  });
  return fulfillDuplicateStrategy(strategy.id, strategyId, requestTimestamp);
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

async function getFulfillCombineWithBasket(
  [requestCombineWithBasketAction]: [
    InferAction<typeof requestCombineWithBasket>
  ],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof requestPutStrategyStepTree>> {
  const {
    strategyId,
    basketRecordClass,
    basketSearchUrlSegment,
    basketDatasetParamName,
    basketSearchDisplayName,
    booleanSearchUrlSegment,
    booleanSearchParamValues,
    booleanSearchDisplayName,
    addType,
  } = requestCombineWithBasketAction.payload;

  const strategyEntry = state$.value.strategies.strategies[strategyId];

  if (strategyEntry == null || strategyEntry.strategy == null) {
    throw new Error(
      `Tried to combine your basket in strategy #${strategyId}, which is pending`
    );
  }

  const datasetId = await wdkService.createDataset({
    sourceType: 'basket',
    sourceContent: {
      basketName: basketRecordClass,
    },
  });

  const [{ id: basketStepId }, { id: booleanStepId }] = await Promise.all([
    wdkService.createStep({
      searchName: basketSearchUrlSegment,
      searchConfig: {
        parameters: {
          [basketDatasetParamName]: `${datasetId}`,
        },
      },
      customName: basketSearchDisplayName,
    }),
    wdkService.createStep({
      searchName: booleanSearchUrlSegment,
      searchConfig: {
        parameters: booleanSearchParamValues,
      },
      customName: booleanSearchDisplayName,
    }),
  ]);

  const oldStepTree = strategyEntry.strategy.stepTree;
  const newStepTree = addStep(oldStepTree, addType, booleanStepId, {
    stepId: basketStepId,
    primaryInput: undefined,
    secondaryInput: undefined,
  });

  return requestPutStrategyStepTree(strategyId, newStepTree);
}

async function getFulfillCombineWithStrategy(
  [requestCombineWithStrategyAction]: [
    InferAction<typeof requestCombineWithStrategy>
  ],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof requestPutStrategyStepTree>> {
  const {
    strategyId,
    secondaryInputStrategyId,
    secondaryInputName,
    booleanSearchUrlSegment,
    booleanSearchParamValues,
    booleanSearchDisplayName,
    addType,
  } = requestCombineWithStrategyAction.payload;

  const strategyEntry = state$.value.strategies.strategies[strategyId];

  if (strategyEntry == null || strategyEntry.strategy == null) {
    throw new Error(
      `Tried to combine strategy #${secondaryInputStrategyId} with strategy #${strategyId}, which is pending`
    );
  }

  const operatorStepPromise = wdkService.createStep({
    searchName: booleanSearchUrlSegment,
    searchConfig: {
      parameters: booleanSearchParamValues,
    },
    customName: booleanSearchDisplayName,
    expandedName: `Copy of ${secondaryInputName}`,
  });

  const duplicateStepTreePromise = wdkService.getDuplicatedStrategyStepTree(
    secondaryInputStrategyId
  );

  const [{ id: booleanStepId }, duplicatedStepTree] = await Promise.all([
    operatorStepPromise,
    duplicateStepTreePromise,
  ]);

  const oldStepTree = strategyEntry.strategy.stepTree;
  const newStepTree = addStep(
    oldStepTree,
    addType,
    booleanStepId,
    duplicatedStepTree
  );

  return requestPutStrategyStepTree(strategyId, newStepTree);
}

async function updateStepPropertiesAndSearchConfig(
  wdkService: WdkService,
  strategyId: number,
  stepId: number,
  stepSpec: PatchStepSpec | undefined,
  searchConfig: SearchConfig
) {
  const strategy = await wdkService.getStrategy(strategyId);
  if (strategy.isSaved) {
    // Make duplicate strategy and apply changes to it
    const { id: duplicateStrategyId } = await wdkService.duplicateStrategy({
      sourceStrategySignature: strategy.signature,
    });
    const duplicateStrategy = await wdkService.getStrategy(duplicateStrategyId);
    const oldStepIds = getStepIds(strategy.stepTree);
    const duplicateStepIds = getStepIds(duplicateStrategy.stepTree);
    const duplicateStepId = duplicateStepIds[oldStepIds.indexOf(stepId)];
    if (duplicateStepId == null)
      throw new Error('Could not revise step of draft strategy.');
    // Map answer param values to new step ids
    const { searchName } = duplicateStrategy.steps[duplicateStepId];
    const question = await wdkService.getQuestionAndParameters(searchName);
    const duplicateParameters = question.parameters.reduce(
      (duplicateParameters, parameter) =>
        Object.assign(duplicateParameters, {
          [parameter.name]:
            parameter.type === 'input-step'
              ? String(
                  duplicateStepIds[
                    oldStepIds.indexOf(
                      Number(searchConfig.parameters[parameter.name])
                    )
                  ]
                )
              : searchConfig.parameters[parameter.name],
        }),
      { ...searchConfig.parameters }
    );
    const duplicateSearchConfig = {
      ...searchConfig,
      parameters: duplicateParameters,
    };

    try {
      await wdkService.updateStepSearchConfig(
        duplicateStepId,
        duplicateSearchConfig
      );

      if (stepSpec != null) {
        await wdkService.updateStepProperties(duplicateStepId, stepSpec);
      }

      return fulfillDraftStrategy(
        await wdkService.getStrategy(duplicateStrategyId),
        strategyId
      );
    } catch (error) {
      return reportSubmissionError(searchName, error, wdkService);
    }
  }

  try {
    await wdkService.updateStepSearchConfig(stepId, searchConfig);

    if (stepSpec != null) {
      await wdkService.updateStepProperties(stepId, stepSpec);
    }

    return fulfillStrategy(await wdkService.getStrategy(strategyId));
  } catch (error) {
    return reportSubmissionError(
      strategy.steps[stepId].searchName,
      error,
      wdkService
    );
  }
}

export const observe = combineEpics(
  mrate([requestStrategy], getFulfillStrategy, {
    areActionsNew: stubTrue,
  }),
  mrate([requestPatchStrategyProperties], getFulfillPatchStrategy),
  mrate([requestSaveAsStrategy], getFulfilllSaveAs),
  mrate(
    [requestDeleteOrRestoreStrategies],
    getFulfillDeleteOrRestoreStrategies
  ),
  mrate([requestPutStrategyStepTree], getFulfillStrategy_PutStepTree), // replace saved with unsaved
  mrate([fulfillSaveAsStrategy], getFulfillStrategy_SaveAs, {
    areActionsNew: stubTrue,
  }),
  mrate([fulfillPatchStrategyProperties], getFulfillStrategy_PatchStratProps, {
    areActionsNew: stubTrue,
    areActionsCoherent: areFulfillStrategy_PatchStratPropsActionsCoherent,
  }),
  mrate([requestUpdateStepProperties], getFulfillStrategy_PatchStepProps, {
    areActionsNew: stubTrue,
  }),
  mrate(
    [requestUpdateStepSearchConfig],
    getFulfillStrategy_PostStepSearchConfig, // replace saved with unsaved
    { areActionsNew: stubTrue }
  ),
  mrate([requestReplaceStep], getFulfillStrategy_ReplaceStep, {
    areActionsNew: stubTrue,
  }),
  mrate(
    [requestRemoveStepFromStepTree],
    getFulfillStrategy_RemoveStepFromStepTree, // replace saved with unsaved
    { areActionsNew: stubTrue }
  ),
  mrate([requestDeleteStep], getFulfillDeleteStep),
  mrate([requestCreateStrategy], getFulfillCreateStrategy),
  mrate([requestDeleteStrategy], getFulfillStrategyDelete),
  mrate([requestDuplicateStrategy], getFulfillDuplicateStrategy),
  mrate([requestCreateStep], getFulfillCreateStep),
  mrate([requestCombineWithBasket], getFulfillCombineWithBasket),
  mrate([requestCombineWithStrategy], getFulfillCombineWithStrategy),
  mrate([requestReviseStep], getFulfillStrategy_ReviseStep, {
    areActionsNew: stubTrue,
  })
);
