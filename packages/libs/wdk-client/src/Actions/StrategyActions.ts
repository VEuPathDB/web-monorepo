import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { NewStrategySpec, DuplicateStrategySpec, DeleteStrategySpec, StrategyDetails, StrategyProperties, StepTree, NewStepSpec, PatchStepSpec } from "wdk-client/Utils/WdkUser";
import { AnswerSpec, Answer, StandardReportConfig } from 'wdk-client/Utils/WdkModel';
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

export const requestDeleteOrRestoreStrategies = makeActionCreator(
    'requestDeleteOrRestoreStrategies',
    (deleteStrategiesSpecs: DeleteStrategySpec[]) => ({ deleteStrategiesSpecs, requestTimestamp: Date.now() })
);

export const fulfillDeleteOrRestoreStrategies = makeActionCreator(
    'fulfillDeleteOrRestoreStrategies',
    ( requestTimestamp: number) => ({ requestTimestamp })
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

export const requestPutStrategyStepTree = makeActionCreator(
    'requestPutStrategyStepTree',
    (strategyId: number, newStrategySpec: NewStrategySpec) => ({ strategyId, newStrategySpec })
);

export const requestGetDuplicatedStrategyStepTree = makeActionCreator(
    'requestGetDuplicatedStrategyStepTree',
    (strategyId: number) => ({ strategyId, requestTimestamp: Date.now() })
);

export const fulfillGetDuplicatedStrategyStepTree = makeActionCreator(
    'fulfillGetDuplicatedStrategyStepTree',
    (strategyId: number, requestTimestamp: number, stepTree: StepTree) => ({ strategyId, requestTimestamp,  stepTree})
);

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

export const requestUpdateStepSearchConfig = makeActionCreator(
    'requestSearchConfigUpdate',
    (strategyId: number, stepId: number, answerSpec: AnswerSpec) => ({ strategyId, stepId, answerSpec })
);

export const openStrategy = makeActionCreator(
    'openStrategy',
    (strategyId: number) => ({ strategyId })
);

export const closeStrategy = makeActionCreator(
    'closeStrategy',
    (strategyId: number) => ({ strategyId })
);

export type Action =
| InferAction<typeof requestCreateStrategy>
| InferAction<typeof fulfillCreateStrategy>
| InferAction<typeof requestDeleteStrategy>
| InferAction<typeof fulfillDeleteStrategy>
| InferAction<typeof requestDeleteOrRestoreStrategies>
| InferAction<typeof fulfillDeleteOrRestoreStrategies>
| InferAction<typeof requestDuplicateStrategy>
| InferAction<typeof fulfillDuplicateStrategy>
| InferAction<typeof requestStrategy>
| InferAction<typeof fulfillStrategy>
| InferAction<typeof requestPatchStrategyProperties>
| InferAction<typeof requestPutStrategyStepTree>
| InferAction<typeof requestGetDuplicatedStrategyStepTree>
| InferAction<typeof fulfillGetDuplicatedStrategyStepTree>
| InferAction<typeof requestUpdateStepProperties>
| InferAction<typeof requestCreateStep>
| InferAction<typeof fulfillCreateStep>
| InferAction<typeof requestStepCustomReport>
| InferAction<typeof fulfillStepCustomReport>
| InferAction<typeof requestStepStandardReport>
| InferAction<typeof fulfillStepStandardReport>
| InferAction<typeof requestUpdateStepSearchConfig>
| InferAction<typeof requestDeleteStep>
| InferAction<typeof openStrategy>
| InferAction<typeof closeStrategy>

