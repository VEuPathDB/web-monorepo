import { requestGenomeSummaryReport, fulfillGenomeSummaryReport} from 'wdk-client/Actions/SummaryView/GenomeSummaryViewActions';

import { Action } from 'wdk-client/Actions';
import { getStepBundlePromise } from 'wdk-client/Utils/stepUtils';
import WdkService from 'wdk-client/Utils/WdkService';
import { GenomeSummaryViewReport } from 'wdk-client/Utils/WdkModel';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { mergeMapRequestActionsToEpic } from 'wdk-client/Utils/ActionCreatorUtils';
import { combineEpics} from 'redux-observable';

import { Observable } from 'rxjs';

export const key = 'genomeSummaryView';

export type State = {
    genomeSummaryData?: GenomeSummaryViewReport,
};

const initialState: State = {
    genomeSummaryData: undefined,
};

export function reduce(state: State = initialState, action: Action): State {
    switch (action.type) {
        case fulfillGenomeSummaryReport.type: {
                return { ...state, genomeSummaryData: action.payload.genomeSummaryViewReport }        
        } default: {
            return state;
        }
    }
}

function getFormatFromRecordClassName(recordClassName: string) : string {
    switch (recordClassName) {
    case "TranscriptRecordClasses.TranscriptRecordClass":
        return "geneGenomeSummaryView";
    case "DynSpanRecordClasses.DynSpanRecordClass":
        return "dynamicSpanSummaryView";
    default:
        throw "This step cannot use this summary view, it is the wrong record class: " + recordClassName;
    }
}

async function getFormat(stepId: number, wdkService: WdkService) : Promise<string> {
    let stepBundlePromise = getStepBundlePromise(stepId, wdkService);
    let bundle = await stepBundlePromise;
    return getFormatFromRecordClassName(bundle.recordClass.name);
}

async function getGenomeSummaryViewReport([requestAction]:  [InferAction<typeof requestGenomeSummaryReport>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillGenomeSummaryReport>> {
    let format = await getFormat(requestAction.payload.stepId, wdkService);
    let report = await wdkService.getStepAnswer(requestAction.payload.stepId, { format: format});
    return fulfillGenomeSummaryReport((<GenomeSummaryViewReport>report))
}

export const observe =
     combineEpics(
         mergeMapRequestActionsToEpic([requestGenomeSummaryReport], getGenomeSummaryViewReport)
     );
