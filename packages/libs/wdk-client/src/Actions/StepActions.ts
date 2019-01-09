import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { Step } from "wdk-client/Utils/WdkUser";
import { NewStepSpec } from "wdk-client/Utils/WdkModel";


export const requestStep = makeActionCreator(
    'requestStep',
    (stepId: number) => ({ stepId })
);

export const fulfillStep = makeActionCreator(
    'fulfillStep',
    (step: Step) => ({ step })
);

export const requestStepUpdate = makeActionCreator(
    'requestStepUpdate',
    (stepId: number, stepSpec: NewStepSpec) => ({ stepId, stepSpec })
);

export type Action =
    | InferAction<typeof requestStep>
    | InferAction<typeof requestStepUpdate>
    | InferAction<typeof fulfillStep>

