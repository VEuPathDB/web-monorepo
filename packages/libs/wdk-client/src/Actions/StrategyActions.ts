import { makeActionCreator, InferAction } from '../Utils/ActionCreatorUtils';
import {
  NewStrategySpec,
  DeleteStrategySpec,
  StrategyDetails,
  StrategyProperties,
  StepTree,
  NewStepSpec,
  PatchStepSpec,
  SaveStrategyOptions,
} from '../Utils/WdkUser';
import { Answer, StandardReportConfig, SearchConfig } from '../Utils/WdkModel';
import { AnswerFormatting } from '../Service/Mixins/SearchReportsService';
import { AddType } from '../Views/Strategy/Types';

export const requestCreateStrategy = makeActionCreator(
  'requestCreateStrategy',
  (newStrategySpec: NewStrategySpec) => ({
    newStrategySpec,
    requestTimestamp: Date.now(),
  })
);

export const fulfillCreateStrategy = makeActionCreator(
  'fulfillCreateStrategy',
  (strategyId: number, requestTimestamp: number) => ({
    strategyId,
    requestTimestamp,
  })
);

export const requestStrategy = makeActionCreator(
  'requestStrategy',
  (strategyId: number) => ({ strategyId })
);

// Cancel any type of strategy request (update, create, fetch, etc).
export const cancelStrategyRequest = makeActionCreator(
  'cancelStrategyRequest',
  (strategyId: number) => ({ strategyId })
);

export const fulfillStrategy = makeActionCreator(
  'fulfillStrategy',
  (strategy: StrategyDetails) => ({ strategy })
);

export const fulfillStrategyError = makeActionCreator(
  'fulfillStrategyError',
  (strategyId: number, error: Error) => ({ strategyId, error })
);

export const fulfillPutStrategy = makeActionCreator(
  'fulfillPutStrategy',
  (strategy: StrategyDetails, oldStepTree: StepTree) => ({
    strategy,
    oldStepTree,
  })
);

// A draft of a saved strategy was fulfilled
export const fulfillDraftStrategy = makeActionCreator(
  'fulfillDraftStrategy',
  (strategy: StrategyDetails, savedStrategyId: number) => ({
    strategy,
    savedStrategyId,
  })
);

export const requestDeleteOrRestoreStrategies = makeActionCreator(
  'requestDeleteOrRestoreStrategies',
  (deleteStrategiesSpecs: DeleteStrategySpec[]) => ({
    deleteStrategiesSpecs,
    requestTimestamp: Date.now(),
  })
);

export const cancelRequestDeleteOrRestoreStrategies = makeActionCreator(
  'cancelRequestDeleteOrRestoreStrategies',
  (deleteStrategiesSpecs: DeleteStrategySpec[], requestTimestamp: number) => ({
    deleteStrategiesSpecs,
    requestTimestamp,
  })
);

export const fulfillDeleteOrRestoreStrategies = makeActionCreator(
  'fulfillDeleteOrRestoreStrategies',
  (deleteStrategiesSpecs: DeleteStrategySpec[], requestTimestamp: number) => ({
    deleteStrategiesSpecs,
    requestTimestamp,
  })
);

export const requestDeleteStrategy = makeActionCreator(
  'requestDeleteStrategy',
  (strategyId: number) => ({ strategyId })
);

export const fulfillDeleteStrategy = makeActionCreator(
  'fulfillDeleteStrategy',
  (strategyId: number) => ({ strategyId })
);

export const requestDuplicateStrategy = makeActionCreator(
  'requestDuplicateStrategy',
  (strategyId: number) => ({ strategyId, requestTimestamp: Date.now() })
);

export const fulfillDuplicateStrategy = makeActionCreator(
  'fulfillDuplicateStrategy',
  (strategyId: number, sourceStrategyId: number, requestTimestamp: number) => ({
    strategyId,
    sourceStrategyId,
    requestTimestamp,
  })
);

export const requestPatchStrategyProperties = makeActionCreator(
  'requestPatchStrategyProperties',
  (strategyId: number, strategyProperties: Partial<StrategyProperties>) => ({
    strategyId,
    strategyProperties,
  })
);

export const requestSaveAsStrategy = makeActionCreator(
  'requestSaveAsStrategy',
  (strategyId: number, targetName: string, options: SaveStrategyOptions) => ({
    strategyId,
    targetName,
    options,
  })
);

export const fulfillSaveAsStrategy = makeActionCreator(
  'fulfillSaveAsStrategy',
  (oldStrategyId: number, newStrategyId: number) => ({
    oldStrategyId,
    newStrategyId,
  })
);

export const fulfillPatchStrategyProperties = makeActionCreator(
  'fulfillPatchStrategyProperties',
  (strategyId: number) => ({ strategyId })
);

export const requestPutStrategyStepTree = makeActionCreator(
  'requestPutStrategyStepTree',
  (strategyId: number, newStepTree: StepTree) => ({ strategyId, newStepTree })
);

export const requestGetDuplicatedStrategyStepTree = makeActionCreator(
  'requestGetDuplicatedStrategyStepTree',
  (strategyId: number) => ({ strategyId, requestTimestamp: Date.now() })
);

export const fulfillGetDuplicatedStrategyStepTree = makeActionCreator(
  'fulfillGetDuplicatedStrategyStepTree',
  (strategyId: number, requestTimestamp: number, stepTree: StepTree) => ({
    strategyId,
    requestTimestamp,
    stepTree,
  })
);

export const requestRemoveStepFromStepTree = makeActionCreator(
  'requestRemoveStepFromStepTree',
  (
    strategyId: number,
    stepIdToRemove: number,
    stepTree: StepTree,
    deleteSubtree: boolean = false
  ) => ({ strategyId, stepIdToRemove, stepTree, deleteSubtree })
);

export const requestUpdateStepProperties = makeActionCreator(
  'requestUpdateStepProperties',
  (strategyId: number, stepId: number, stepSpec: PatchStepSpec) => ({
    strategyId,
    stepId,
    stepSpec,
  })
);

// need timestamp to match this request with its fulfill
export const requestCreateStep = makeActionCreator(
  'requestCreateStep',
  (newStepSpec: NewStepSpec) => ({ newStepSpec, requestTimestamp: Date.now() })
);

export const fulfillCreateStep = makeActionCreator(
  'fulfillCreateStep',
  (stepId: number, requestTimestamp: number) => ({ stepId, requestTimestamp })
);

export const requestStepCustomReport = makeActionCreator(
  'requestStepCustomReport',
  (stepId: number, reportConfig: AnswerFormatting) => ({
    stepId,
    formatting: reportConfig,
    requestTimestamp: Date.now(),
  })
);

export const fulfillStepCustomReport = makeActionCreator(
  'fulfillStepCustomReport',
  (stepId: number, report: any, requestTimestamp: number) => ({
    stepId,
    report,
    requestTimestamp,
  })
);

export const requestStepStandardReport = makeActionCreator(
  'requestStepCustomReport',
  (stepId: number, reportConfig: StandardReportConfig) => ({
    stepId,
    reportConfig,
    requestTimestamp: Date.now(),
  })
);

export const fulfillStepStandardReport = makeActionCreator(
  'fulfillStepStandardReport',
  (stepId: number, report: Answer, requestTimestamp: number) => ({
    stepId,
    report,
    requestTimestamp,
  })
);

export const requestDeleteStep = makeActionCreator(
  'requestDeleteStep',
  (strategyId: number, stepId: number) => ({ strategyId, stepId })
);

export const fulfillDeleteStep = makeActionCreator(
  'fulfillDeleteStep',
  (strategyId: number, stepId: number) => ({ strategyId, stepId })
);

export const requestUpdateStepSearchConfig = makeActionCreator(
  'requestSearchConfigUpdate',
  (strategyId: number, stepId: number, searchConfig: SearchConfig) => ({
    strategyId,
    stepId,
    searchConfig,
  })
);

export const requestReplaceStep = makeActionCreator(
  'requestReplaceStep',
  (strategyId: number, stepId: number, newStepSpec: NewStepSpec) => ({
    strategyId,
    stepId,
    newStepSpec,
  })
);

export const requestCombineWithBasket = makeActionCreator(
  'requestCombineWithBasket',
  (
    strategyId: number,
    basketRecordClass: string,
    basketSearchUrlSegment: string,
    basketDatasetParamName: string,
    basketSearchDisplayName: string,
    booleanSearchUrlSegment: string,
    booleanSearchParamValues: Record<string, string>,
    booleanSearchDisplayName: string,
    addType: AddType
  ) => ({
    strategyId,
    basketRecordClass,
    basketSearchUrlSegment,
    basketDatasetParamName,
    basketSearchDisplayName,
    booleanSearchUrlSegment,
    booleanSearchParamValues,
    booleanSearchDisplayName,
    addType,
  })
);

export const requestCombineWithStrategy = makeActionCreator(
  'requestCombineWithStrategy',
  (
    strategyId: number,
    secondaryInputStrategyId: number,
    secondaryInputName: string,
    booleanSearchUrlSegment: string,
    booleanSearchParamValues: Record<string, string>,
    booleanSearchDisplayName: string,
    addType: AddType
  ) => ({
    strategyId,
    secondaryInputStrategyId,
    secondaryInputName,
    booleanSearchUrlSegment,
    booleanSearchParamValues,
    booleanSearchDisplayName,
    addType,
  })
);

export const requestReviseStep = makeActionCreator(
  'requestReviseStep',
  (
    strategyId: number,
    stepId: number,
    stepSpec: PatchStepSpec,
    searchConfig: SearchConfig
  ) => ({ strategyId, stepId, stepSpec, searchConfig })
);

export type Action = InferAction<
  | typeof cancelStrategyRequest
  | typeof requestCreateStrategy
  | typeof fulfillCreateStrategy
  | typeof requestDeleteStrategy
  | typeof fulfillDeleteStrategy
  | typeof requestDeleteOrRestoreStrategies
  | typeof cancelRequestDeleteOrRestoreStrategies
  | typeof fulfillDeleteOrRestoreStrategies
  | typeof requestDuplicateStrategy
  | typeof fulfillDuplicateStrategy
  | typeof requestStrategy
  | typeof fulfillStrategy
  | typeof fulfillStrategyError
  | typeof fulfillPutStrategy
  | typeof fulfillDraftStrategy
  | typeof requestPatchStrategyProperties
  | typeof fulfillPatchStrategyProperties
  | typeof requestSaveAsStrategy
  | typeof fulfillSaveAsStrategy
  | typeof requestPutStrategyStepTree
  | typeof requestGetDuplicatedStrategyStepTree
  | typeof fulfillGetDuplicatedStrategyStepTree
  | typeof requestRemoveStepFromStepTree
  | typeof requestUpdateStepProperties
  | typeof requestCreateStep
  | typeof fulfillCreateStep
  | typeof requestStepCustomReport
  | typeof fulfillStepCustomReport
  | typeof requestStepStandardReport
  | typeof fulfillStepStandardReport
  | typeof requestUpdateStepSearchConfig
  | typeof requestReplaceStep
  | typeof requestDeleteStep
  | typeof fulfillDeleteStep
  | typeof requestCombineWithBasket
  | typeof requestCombineWithStrategy
  | typeof requestReviseStep
>;
