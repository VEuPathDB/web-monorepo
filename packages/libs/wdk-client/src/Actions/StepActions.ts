import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { Step } from "wdk-client/Utils/WdkUser";
import { SearchConfig, PatchStepSpec } from "wdk-client/Utils/WdkModel";

export const requestStep = makeActionCreator(
    'requestStep',
    (stepId: number) => ({ stepId })
);

export const requestStepUpdate = makeActionCreator(
    'requestStepUpdate',
    (stepId: number, stepSpec: PatchStepSpec) => ({ stepId, stepSpec })
);

export const requestSearchConfigUpdate = makeActionCreator(
    'requestSearchConfigUpdate',
    (stepId: number, searchConfig: SearchConfig) => ({ stepId, searchConfig })
);

export const fulfillStep = makeActionCreator(
    'fulfillStep',
    (step: Step) => ({ step })
);

export const fulfillStepError = makeActionCreator(
  'fulfillStepError',
  (stepId: number, errorMessage: string) => ({ stepId, errorMessage })
);

export const fulfillStepUnauthorized = makeActionCreator(
  'fulfillStepUnauthorized',
  (stepId: number) => ({ stepId })
);

export type Action =
    | InferAction<typeof requestStep>
    | InferAction<typeof requestStepUpdate>
    | InferAction<typeof requestSearchConfigUpdate>
    | InferAction<typeof fulfillStep>
    | InferAction<typeof fulfillStepError>
    | InferAction<typeof fulfillStepUnauthorized>

