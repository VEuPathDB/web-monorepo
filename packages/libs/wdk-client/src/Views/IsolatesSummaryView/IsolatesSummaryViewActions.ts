export const loadingType = 'isolatesSummaryView/loading';

export type LoadingAction = {
    type: typeof loadingType,
    payload: {
        stepId: number
    }
};

export function createLoadingAction(stepId: number): LoadingAction {
    return {
        type: loadingType,
        payload: { stepId: stepId }
    }
};

////////////////////////////////////////////////////////////////////////////////////

import { IsolatesSummaryViewReport } from "wdk-client/Utils/WdkModel";

export const completedType = 'isolatesSummaryView/completed';

export type CompletedAction = {
    type: typeof completedType,
    payload: {
        isolatesSummaryViewReport: IsolatesSummaryViewReport
    }
};

export function createCompletedAction(isolatesSummaryViewReport: IsolatesSummaryViewReport): CompletedAction {
    return {
        type: completedType,
        payload: {
            isolatesSummaryViewReport
        }
    }
};

///////////////////////////////////////////////////////////////////////////////////////

export const errorType = 'isolatesSummaryView/error';

export type ErrorAction = {
    type: typeof errorType,
    payload: {
        error: Error
    }
};

export function createErrorAction(error: Error): ErrorAction {
    return {
        type: errorType,
        payload: {
            error
        }
    }
};

////////////////////////////////////////////////////////////////////////////////////////

