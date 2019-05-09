import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { StandardReportConfig, Answer, AnswerSpec } from "wdk-client/Utils/WdkModel";
import { Step, PatchStepSpec } from "wdk-client/Utils/WdkUser";
import { NewStepSpec } from '../Utils/WdkUser';
import { AnswerFormatting } from 'wdk-client/Service/Mixins/SearchReportsService';

export const requestStep = makeActionCreator(
    'requestStep',
    (stepId: number) => ({ stepId })
);

export const requestStepUpdate = makeActionCreator(
    'requestStepUpdate',
    (stepId: number, stepSpec: PatchStepSpec) => ({ stepId, stepSpec })
);

export const requestStepSearchConfigUpdate = makeActionCreator(
    'requestStepSearchConfigUpdate',
    (stepId: number, answerSpec: AnswerSpec) => ({ stepId, answerSpec })
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
    (stepId: number) => ({ stepId })
);

export const fulfillDeleteStep = makeActionCreator(
    'fulfillDeleteStep',
    (stepId: number) => ({ stepId })
);

export type Action =
    | InferAction<typeof requestStep>
    | InferAction<typeof requestStepUpdate>
    | InferAction<typeof requestStepSearchConfigUpdate>
    | InferAction<typeof fulfillStep>
    | InferAction<typeof fulfillStepError>
    | InferAction<typeof fulfillStepUnauthorized>
    | InferAction<typeof requestCreateStep>
    | InferAction<typeof fulfillCreateStep>
    | InferAction<typeof requestStepCustomReport>
    | InferAction<typeof fulfillStepCustomReport>
    | InferAction<typeof requestStepStandardReport>
    | InferAction<typeof fulfillStepStandardReport>
    | InferAction<typeof requestDeleteStep>
    | InferAction<typeof fulfillDeleteStep>



