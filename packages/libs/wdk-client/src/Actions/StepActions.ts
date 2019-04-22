import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { Step } from "wdk-client/Utils/WdkUser";
import { StepSpec } from "wdk-client/Utils/WdkModel";

export const requestStep = makeActionCreator(
    'requestStep',
    (stepId: number) => ({ stepId })
);

export const requestStepUpdate = makeActionCreator(
    'requestStepUpdate',
    (stepId: number, stepSpec: StepSpec) => ({ stepId, stepSpec })
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
    | InferAction<typeof fulfillStep>
    | InferAction<typeof fulfillStepError>
    | InferAction<typeof fulfillStepUnauthorized>

