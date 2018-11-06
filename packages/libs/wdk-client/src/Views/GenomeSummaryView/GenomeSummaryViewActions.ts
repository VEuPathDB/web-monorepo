export const loadingType = 'genomeSummaryView/loading';

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

import { GenomeSummaryViewReport } from "wdk-client/Utils/WdkModel";

export const completedType = 'genomeSummaryView/completed';

export type CompletedAction = {
    type: typeof completedType,
    payload: {
        genomeSummaryViewReport: GenomeSummaryViewReport
    }
};

export function createCompletedAction(genomeSummaryViewReport: GenomeSummaryViewReport): CompletedAction {
    return {
        type: completedType,
        payload: {
            genomeSummaryViewReport
        }
    }
};

///////////////////////////////////////////////////////////////////////////////////////

export const errorType = 'GenomeSummaryView/error';

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

