import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { StrategySummary, NewStrategySpec, DuplicateStrategySpec, DeleteStrategySpec, StrategyDetails, StrategyProperties, StepTree } from "wdk-client/Utils/WdkUser";

export const requestStrategies = makeActionCreator(
    'requestStrategies',
    () => ({ })
);

export const fulfillStrategies = makeActionCreator(
    'fulfillStrategies',
    (strategySummary: StrategySummary) => ({ strategySummary })
);

export const requestCreateStrategy = makeActionCreator(
    'requestCreateStrategy',
    (newStrategySpec: NewStrategySpec) => ({ newStrategySpec, requestTimestamp: Date.now() })
);

export const fulfillCreateStrategy = makeActionCreator(
    'fulfillCreateStrategy',
    (strategySummary: StrategySummary, requestTimestamp: number) => ({ strategySummary, requestTimestamp })
);

export const requestDeleteStrategy = makeActionCreator(
    'requestDeleteStrategy',
    (deleteStrategiesSpecs: DeleteStrategySpec[]) => ({ deleteStrategiesSpecs, requestTimestamp: Date.now() })
);

export const fulfillDeleteStrategy = makeActionCreator(
    'fulfillDeleteStrategy',
    ( requestTimestamp: number) => ({ requestTimestamp })
);

export const requestDuplicateStrategy = makeActionCreator(
    'requestDuplicateStrategy',
    (copyStepSpec: DuplicateStrategySpec) => ({ copyStepSpec, requestTimestamp: Date.now() })
);

export const fulfillDuplicateStrategy = makeActionCreator(
    'fulfillDuplicateStrategy',
    (strategyId: number, requestTimestamp: number) => ({ strategyId, requestTimestamp })
);

export const requestGetStrategy = makeActionCreator(
    'requestGetStrategy',
    (strategyId: number) => ({ strategyId })
);

export const fulfillGetStrategy = makeActionCreator(
    'fulfillGetStrategy',
    (strategy: StrategyDetails) => ({ strategy })
);

export const requestPatchStrategyProperties = makeActionCreator(
    'requestPatchStrategyProperties',
    (strategyId: number, strategyProperties: StrategyProperties) => ({ strategyId, strategyProperties })
);

export const fulfillPatchStrategyProperties = makeActionCreator(
    'fulfillPatchStrategyProperties',
    (strategyId: number) => ({ strategyId })
);

export const requestPutStrategyStepTree = makeActionCreator(
    'requestPutStrategyStepTree',
    (strategyId: number, newStrategySpec: NewStrategySpec) => ({ strategyId, newStrategySpec })
);

export const fulfillPutStrategyStepTree = makeActionCreator(
    'fulfillPutStrategyStepTree',
    (strategyId: number) => ({ strategyId })
);

export const requestGetDuplicatedStrategyStepTree = makeActionCreator(
    'requestGetDuplicatedStrategyStepTree',
    (strategyId: number) => ({ strategyId, requestTimestamp: Date.now() })
);

export const fulfillGetDuplicatedStrategyStepTree = makeActionCreator(
    'fulfillGetDuplicatedStrategyStepTree',
    (strategyId: number, requestTimestamp: number, stepTree: StepTree) => ({ strategyId, requestTimestamp,  stepTree})
);


export type Action =
| InferAction<typeof requestStrategies>
| InferAction<typeof fulfillStrategies>
| InferAction<typeof requestCreateStrategy>
| InferAction<typeof fulfillCreateStrategy>
| InferAction<typeof requestDeleteStrategy>
| InferAction<typeof fulfillDeleteStrategy>
| InferAction<typeof requestDuplicateStrategy>
| InferAction<typeof fulfillDuplicateStrategy>
| InferAction<typeof requestGetStrategy>
| InferAction<typeof fulfillGetStrategy>
| InferAction<typeof requestPatchStrategyProperties>
| InferAction<typeof fulfillPatchStrategyProperties>
| InferAction<typeof requestPutStrategyStepTree>
| InferAction<typeof fulfillPutStrategyStepTree>
| InferAction<typeof requestGetDuplicatedStrategyStepTree>
| InferAction<typeof fulfillGetDuplicatedStrategyStepTree>
