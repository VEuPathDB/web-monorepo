import { requestIsolatesSummaryReport, fulfillIsolatesSummaryReport} from 'wdk-client/Actions/SummaryView/IsolatesSummaryViewActions';

import { IsolatesSummaryViewReport } from 'wdk-client/Utils/WdkModel';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { Action } from 'wdk-client/Actions';
import { Observable } from 'rxjs';
import { mergeMapRequestActionsToEpic } from 'wdk-client/Utils/ActionCreatorUtils';
import { combineEpics} from 'redux-observable';

export const key = 'isolatesSummaryView';

export type State = {
    isolatesSummaryData?: IsolatesSummaryViewReport,
};

const initialState: State = {
    isolatesSummaryData: undefined
};

export function reduce(state: State = initialState, action: Action): State {
    switch (action.type) {
        case fulfillIsolatesSummaryReport.type: {
            return { ...state, isolatesSummaryData: action.payload.isolatesSummaryViewReport }
        } default: {
            return state;
        }
    }
}

async function getIsolatesSummaryViewReport([requestAction]:  [InferAction<typeof requestIsolatesSummaryReport>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillIsolatesSummaryReport>> {

    let report = await wdkService.getStepAnswer(requestAction.payload.stepId, { format: 'geoIsolateSummaryView'})
    return fulfillIsolatesSummaryReport(report);
}

export const observe =
     combineEpics(
         mergeMapRequestActionsToEpic([requestIsolatesSummaryReport], getIsolatesSummaryViewReport)
     );
