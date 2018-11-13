import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { IsolatesSummaryViewReport } from "wdk-client/Utils/WdkModel";

export const requestIsolatesSummaryReport = makeActionCreator(
    'isolatesSummaryView/requestIsolatesSummaryReport',
    (stepId: number) => ({ stepId })
    );

export const fulfillIsolatesSummaryReport = makeActionCreator(
        'isolatesSummaryView/fulfillIsolatesSummaryReport',
        (isolatesSummaryViewReport: IsolatesSummaryViewReport) => ({ isolatesSummaryViewReport })
        );
    
export type Action =
    | InferAction<typeof requestIsolatesSummaryReport>
    | InferAction<typeof fulfillIsolatesSummaryReport>
