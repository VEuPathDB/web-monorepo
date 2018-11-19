import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { Step } from "wdk-client/Utils/WdkUser";

export const requestStep = makeActionCreator(
    'requestStep',
    (stepId: number) => ({ stepId })
    );

export const fulfillStep = makeActionCreator(
    'fulfillStep',
    (step: Step) => ({ step })
    );

export type Action =
    | InferAction<typeof requestStep>
    | InferAction<typeof fulfillStep>    

