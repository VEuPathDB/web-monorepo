import { LoadingAction, loadingType } from 'wdk-client/Views/GenomeSummaryView/GenomeSummaryViewActions';
import { CompletedAction, completedType, createCompletedAction } from 'wdk-client/Views/GenomeSummaryView/GenomeSummaryViewActions';
import { ErrorAction, errorType, createErrorAction } from 'wdk-client/Views/GenomeSummaryView/GenomeSummaryViewActions';

import { Action } from 'wdk-client/Utils/ActionCreatorUtils';
import { getStepBundlePromise } from 'wdk-client/Utils/StepUtils';
import WdkService from 'wdk-client/Utils/WdkService';
import { GenomeSummaryViewReport } from 'wdk-client/Utils/WdkModel';
import { EpicDependencies } from 'wdk-client/Core/Store';

import { from, Observable } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';

export const key = 'genomeSummaryView';

export type State = {
    genomeSummaryData?: GenomeSummaryViewReport,
    isLoading: boolean,
    error?: Error
};

const initialState: State = {
    genomeSummaryData: undefined,
    isLoading: false,
    error: undefined
};

export function reduce(state: State = initialState, action: LoadingAction | CompletedAction | ErrorAction): State {
    switch (action.type) {
        case loadingType: {
            return { ...state, isLoading: true };
        } case completedType: {
            return { ...state, genomeSummaryData: action.payload.genomeSummaryViewReport, isLoading: false }
        } case errorType: {
            return { ...state, error: action.payload.error };
        } default: {
            return state;
        }
    }
}

function isLoadingAction(action: Action): action is LoadingAction {
    return action.type === loadingType;
}

function getFormatFromRecordClassName(recordClassName: string) : string {
    switch (recordClassName) {
    case "TranscriptRecordClass":
        return "geneGenomeSummaryView";
    case "DynSpanRecordClass":
        return "dynamicSpanSummaryView";
    default:
        throw "This step cannot use this summary view, it is the wrong record class";
    }
}

async function getFormat(stepId: number, wdkService: WdkService) : Promise<string> {
    let stepBundlePromise = getStepBundlePromise(stepId, wdkService);
    let bundle = await stepBundlePromise;
    return getFormatFromRecordClassName(bundle.recordClass.name);
}

async function getGenomeSummaryViewReport(stepId: number, wdkService: WdkService ) : Promise<CompletedAction | ErrorAction> {
    try {
        let format = await getFormat(stepId, wdkService);
        let report = await wdkService.getStepAnswer(stepId, { format: format});
        return createCompletedAction((<GenomeSummaryViewReport>report))
    } catch (error) {
        return createErrorAction(error);
    }
}

export function observe(action$: Observable<Action>, state$: Observable<State>, { wdkService }: EpicDependencies): Observable<Action> {
    return action$.pipe(
        filter(isLoadingAction),
            mergeMap(({ payload: { stepId } }) =>
                from(
                    getGenomeSummaryViewReport(stepId, wdkService)
                )
            )
        )
}

