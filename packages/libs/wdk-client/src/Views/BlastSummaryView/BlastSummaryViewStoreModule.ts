import { LoadingAction, loadingType } from 'wdk-client/Views/BlastSummaryView/BlastSummaryViewActions';
import { CompletedAction, completedType, createCompletedAction } from 'wdk-client/Views/BlastSummaryView/BlastSummaryViewActions';
import { ErrorAction, errorType, createErrorAction } from 'wdk-client/Views/BlastSummaryView/BlastSummaryViewActions';

// FIXME Replace with `import { Action } from 'wdk-client/Actions'`. Requires adding BlastSummaryViewActions to that file.
import { Action } from 'redux';
import { BlastSummaryViewReport } from 'wdk-client/Utils/WdkModel';
import { EpicDependencies } from 'wdk-client/Core/Store';

import { from, Observable } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';

export const key = 'blastSummaryView';

export type State = {
    blastSummaryData?: BlastSummaryViewReport,
    isLoading: boolean,
    error?: Error
};

const initialState: State = {
    blastSummaryData: undefined,
    isLoading: false,
    error: undefined
};

export function reduce(state: State = initialState, action: LoadingAction | CompletedAction | ErrorAction): State {
    switch (action.type) {
        case loadingType: {
            return { ...state, isLoading: true };
        } case completedType: {
            return { ...state, blastSummaryData: action.payload.blastInfo, isLoading: false }
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

export function observe(action$: Observable<Action>, state$: Observable<State>, { wdkService }: EpicDependencies): Observable<Action> {
    return action$.pipe(
        filter(isLoadingAction),
            mergeMap(({ payload: { stepId } }) =>
                from(
                    wdkService.getStepAnswer(stepId, { format: 'blastSummaryView', formatConfig: { attributes: ['summary', 'alignment']} }).then(
                        report => createCompletedAction((<BlastSummaryViewReport>report)),
                        error => createErrorAction(error)
                    )
                )
                // .pipe(
                //   takeUntil(action$.pipe(filter(AttributeReportCancelled.test))))
            )
        )
}

