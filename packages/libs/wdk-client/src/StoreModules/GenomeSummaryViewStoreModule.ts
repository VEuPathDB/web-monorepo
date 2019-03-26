import { requestGenomeSummaryReport, fulfillGenomeSummaryReport, showRegionDialog, hideRegionDialog, applyEmptyChromosomesFilter, unapplyEmptyChromosomesFilter} from 'wdk-client/Actions/SummaryView/GenomeSummaryViewActions';

import { Action } from 'wdk-client/Actions';
import { getStepBundlePromise } from 'wdk-client/Utils/stepUtils';
import WdkService from 'wdk-client/Utils/WdkService';
import { GenomeSummaryViewReport, RecordClass } from 'wdk-client/Utils/WdkModel';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { mergeMapRequestActionsToEpic } from 'wdk-client/Utils/ActionCreatorUtils';
import { combineEpics, StateObservable} from 'redux-observable';

import { RootState } from 'wdk-client/Core/State/Types';

export const key = 'genomeSummaryView';

export type State = {
    genomeSummaryData?: GenomeSummaryViewReport;
    recordClass?: RecordClass;
    regionDialogVisibilities: Record<string, boolean>;
    emptyChromosomeFilterApplied: boolean;
};

const initialState: State = {
    genomeSummaryData: undefined,
    recordClass: undefined,
    regionDialogVisibilities: {},
    emptyChromosomeFilterApplied: false
};

export function reduce(state: State = initialState, action: Action): State {
    switch (action.type) {
        case fulfillGenomeSummaryReport.type: {
            return { ...state, genomeSummaryData: action.payload.genomeSummaryViewReport, recordClass: action.payload.recordClass };   
        } 
        case showRegionDialog.type: {
            return { 
                ...state,
                regionDialogVisibilities: {
                    ...state.regionDialogVisibilities,
                    [action.payload.regionId]: true
                }
            };
        }
        case hideRegionDialog.type: {
            return { 
                ...state,
                regionDialogVisibilities: {
                    ...state.regionDialogVisibilities,
                    [action.payload.regionId]: false
                }
            };
        }
        case applyEmptyChromosomesFilter.type: {
            return { ...state, emptyChromosomeFilterApplied: true };
        }
        case unapplyEmptyChromosomesFilter.type: {
            return { ...state, emptyChromosomeFilterApplied: false };
        }
        default: {
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

async function getRecordClassAndFormat(stepId: number, wdkService: WdkService) : Promise<[string, RecordClass]> {
    let stepBundlePromise = getStepBundlePromise(stepId, wdkService);
    let bundle = await stepBundlePromise;
    return [ getFormatFromRecordClassName(bundle.recordClass.name), bundle.recordClass ];
}

async function getGenomeSummaryViewReport([requestAction]:  [InferAction<typeof requestGenomeSummaryReport>], state$: StateObservable<RootState>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillGenomeSummaryReport>> {
    let [ format, recordClass ] = await getRecordClassAndFormat(requestAction.payload.stepId, wdkService);
    let report: GenomeSummaryViewReport = await wdkService.getStepAnswer(requestAction.payload.stepId, { format: format});
    return fulfillGenomeSummaryReport(report, recordClass);
}

export const observe =
     combineEpics(
         mergeMapRequestActionsToEpic([requestGenomeSummaryReport], getGenomeSummaryViewReport)
     );
