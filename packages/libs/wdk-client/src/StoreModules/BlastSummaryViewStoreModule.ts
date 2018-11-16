import { requestBlastSummaryReport, fulfillBlastSummaryReport} from 'wdk-client/Actions/SummaryView/BlastSummaryViewActions';
import { InferAction } from 'wdk-client/Utils/ActionCreatorUtils';

import { Action } from 'wdk-client/Actions';
import { BlastSummaryViewReport } from 'wdk-client/Utils/WdkModel';
import { EpicDependencies } from 'wdk-client/Core/Store';

import { Observable } from 'rxjs';
import {mapRequestActionsToEpic} from 'wdk-client/Utils/ActionCreatorUtils';
import { combineEpics} from 'redux-observable';

export const key = 'blastSummaryView';

export type State = {
    blastSummaryData?: BlastSummaryViewReport,
};

const initialState: State = {
    blastSummaryData: undefined,
};

export function reduce(state: State = initialState, action: Action): State {
    switch (action.type) {
        case fulfillBlastSummaryReport.type: {
            return { ...state, blastSummaryData: action.payload.blastInfo }
        } default: {
            return state;
        }
    }
}

async function getBlastSummaryViewReport([requestAction]:  [InferAction<typeof requestBlastSummaryReport>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillBlastSummaryReport>> {
    let formatting = { format: 'blastSummaryView', formatConfig: { attributes: ['summary', 'alignment']} };
    let report = await wdkService.getStepAnswer(requestAction.payload.stepId, formatting)
    return fulfillBlastSummaryReport(report);
}

export const observe =
     combineEpics(
         mapRequestActionsToEpic([requestBlastSummaryReport], getBlastSummaryViewReport)
     );
