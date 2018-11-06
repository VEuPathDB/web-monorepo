import { LoadingAction, loadingType } from 'wdk-client/Views/IsolatesSummaryView/IsolatesSummaryViewActions';
import { CompletedAction, completedType, createCompletedAction } from 'wdk-client/Views/IsolatesSummaryView/IsolatesSummaryViewActions';
import { ErrorAction, errorType, createErrorAction } from 'wdk-client/Views/IsolatesSummaryView/IsolatesSummaryViewActions';

import { Action } from 'wdk-client/Utils/ActionCreatorUtils';
import { IsolatesSummaryViewReport } from 'wdk-client/Utils/WdkModel';
import { EpicDependencies } from 'wdk-client/Core/Store';

import { from, Observable } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';

export const key = 'isolatesSummaryView';

export type State = {
    isolatesSummaryData?: IsolatesSummaryViewReport,
    isLoading: boolean,
    error?: Error
};

const initialState: State = {
    isolatesSummaryData: undefined,
    isLoading: false,
    error: undefined
};

export function reduce(state: State = initialState, action: LoadingAction | CompletedAction | ErrorAction): State {
    switch (action.type) {
        case loadingType: {
            return { ...state, isLoading: true };
        } case completedType: {
            return { ...state, isolatesSummaryData: action.payload.isolatesSummaryViewReport, isLoading: false }
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
                    wdkService.getStepAnswer(stepId, { format: 'geoIsolateSummaryView'}).then(
                        report => createCompletedAction((<IsolatesSummaryViewReport>report)),
                        error => createErrorAction(error)
                    )
                )
                // .pipe(
                //   takeUntil(action$.pipe(filter(AttributeReportCancelled.test))))
            )
        )
}

