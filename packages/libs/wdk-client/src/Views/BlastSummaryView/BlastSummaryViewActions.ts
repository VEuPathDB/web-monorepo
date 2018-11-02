export const loadingType = 'blastSummaryView/loading';

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

import { BlastSummaryViewReport } from "wdk-client/Utils/WdkModel";

export const completedType = 'blastSummaryView/completed';

export type CompletedAction = {
    type: typeof completedType,
    payload: {
        blastInfo: BlastSummaryViewReport
    }
};

export function createCompletedAction(blastInfo: BlastSummaryViewReport): CompletedAction {
    return {
        type: completedType,
        payload: {
            blastInfo
        }
    }
};

///////////////////////////////////////////////////////////////////////////////////////

export const errorType = 'blastSummaryView/error';

export type ErrorAction = {
    type: typeof errorType,
    payload: {
        message: string
    }
};

export function createErrorAction(message: string): ErrorAction {
    return {
        type: errorType,
        payload: {
            message
        }
    }
};

////////////////////////////////////////////////////////////////////////////////////////

