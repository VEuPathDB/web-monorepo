import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { NewStrategySpec, DuplicateStrategySpec, DeleteStrategySpec, StrategyDetails, StrategyProperties, StepTree, NewStepSpec, PatchStepSpec, SaveStrategyOptions } from "wdk-client/Utils/WdkUser";
import { Answer, StandardReportConfig, SearchConfig } from 'wdk-client/Utils/WdkModel';
import { AnswerFormatting } from 'wdk-client/Service/Mixins/SearchReportsService';

export const requestCreateStrategy = makeActionCreator(
    'requestCreateStrategy',
    (newStrategySpec: NewStrategySpec) => ({ newStrategySpec, requestTimestamp: Date.now() })
);

export const fulfillCreateStrategy = makeActionCreator(
    'fulfillCreateStrategy',
    (strategyId: number, requestTimestamp: number) => ({ strategyId, requestTimestamp })
);

export const requestStrategy = makeActionCreator(
    'requestStrategy',
    (strategyId: number) => ({ strategyId })
);

export const fulfillStrategy = makeActionCreator(
    'fulfillStrategy',
    (strategy: StrategyDetails) => ({ strategy })
);

export const fulfillPutStrategy = makeActionCreator(
    'fulfillPutStrategy',
    (strategy: StrategyDetails) => ({ strategy })
);

export const requestDeleteOrRestoreStrategies = makeActionCreator(
    'requestDeleteOrRestoreStrategies',
    (deleteStrategiesSpecs: DeleteStrategySpec[]) => ({ deleteStrategiesSpecs, requestTimestamp: Date.now() })
);

export const fulfillDeleteOrRestoreStrategies = makeActionCreator(
    'fulfillDeleteOrRestoreStrategies',
    (deleteStrategiesSpecs: DeleteStrategySpec[], requestTimestamp: number) => ({ deleteStrategiesSpecs, requestTimestamp })
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
    (copyStepSpec: DuplicateStrategySpec) => ({ copyStepSpec, requestTimestamp: Date.now() })
);

export const fulfillDuplicateStrategy = makeActionCreator(
    'fulfillDuplicateStrategy',
    (strategyId: number, requestTimestamp: number) => ({ strategyId, requestTimestamp })
);

export const requestPatchStrategyProperties = makeActionCreator(
    'requestPatchStrategyProperties',
    (strategyId: number, strategyProperties: Partial<StrategyProperties>) => ({ strategyId, strategyProperties })
);

export const requestSaveAsStrategy = makeActionCreator(
  'requestSaveAsStrategy',
  (strategyId: number, targetName: string, options: SaveStrategyOptions) => ({ strategyId, targetName, options })
);

export const fulfillSaveAsStrategy = makeActionCreator(
  'fulfillSaveAsStrategy',
  (oldStrategyId: number, newStrategyId: number) => ({ oldStrategyId, newStrategyId })
);

export const fulfillPatchStrategyProperties = makeActionCreator(
    'fulfillPatchStrategyProperties',
    (strategyId: number) => ({ strategyId })
)

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
    (strategyId: number, requestTimestamp: number, stepTree: StepTree) => ({ strategyId, requestTimestamp,  stepTree})
);

export const requestRemoveStepFromStepTree = makeActionCreator(
    'requestRemoveStepFromStepTree',
    (strategyId: number, stepIdToRemove: number, stepTree: StepTree) => ({ strategyId, stepIdToRemove, stepTree })
)

export const requestUpdateStepProperties = makeActionCreator(
    'requestUpdateStepProperties',
    (strategyId: number, stepId: number, stepSpec: PatchStepSpec) => ({ strategyId, stepId, stepSpec })
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
    (stepId: number, reportConfig: AnswerFormatting) => ({ stepId, formatting: reportConfig, requestTimestamp: Date.now() })
);

export const fulfillStepCustomReport = makeActionCreator(
    'fulfillStepCustomReport',
    (stepId: number, report: any, requestTimestamp: number) => ({ stepId, report, requestTimestamp })
);

export const requestStepStandardReport = makeActionCreator(
    'requestStepCustomReport',
    (stepId: number, reportConfig: StandardReportConfig) => ({ stepId, reportConfig, requestTimestamp: Date.now() })
);

export const fulfillStepStandardReport = makeActionCreator(
    'fulfillStepStandardReport',
    (stepId: number, report: Answer, requestTimestamp: number) => ({ stepId, report, requestTimestamp })
);

export const requestDeleteStep = makeActionCreator(
    'requestDeleteStep',
    (strategyId: number, stepId: number) => ({ strategyId, stepId })
);

export const fulfillDeleteStep = makeActionCreator(
    'fulfillDeleteStep',
    (strategyId: number, stepId: number) => ({ strategyId, stepId })
)

export const requestUpdateStepSearchConfig = makeActionCreator(
    'requestSearchConfigUpdate',
    (strategyId: number, stepId: number, searchConfig: SearchConfig) => ({ strategyId, stepId, searchConfig })
);

export const requestReplaceStep = makeActionCreator(
    'requestReplaceStep',
    (strategyId: number, stepId: number, newStepSpec: NewStepSpec) => ({ strategyId, stepId, newStepSpec })
);

export const redirectToNewSearch = makeActionCreator(
    'redirectToNewSearch',
    (newStrategyId: number, newStepId: number) => ({ newStrategyId, newStepId })
);

export type Action = InferAction<
  | typeof requestCreateStrategy
  | typeof fulfillCreateStrategy
  | typeof requestDeleteStrategy
  | typeof fulfillDeleteStrategy
  | typeof requestDeleteOrRestoreStrategies
  | typeof fulfillDeleteOrRestoreStrategies
  | typeof requestDuplicateStrategy
  | typeof fulfillDuplicateStrategy
  | typeof requestStrategy
  | typeof fulfillStrategy
  | typeof fulfillPutStrategy
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
  | typeof redirectToNewSearch
  >

