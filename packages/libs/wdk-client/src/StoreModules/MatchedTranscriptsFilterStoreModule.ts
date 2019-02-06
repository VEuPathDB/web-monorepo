import { openMatchedTranscriptsFilter, closeMatchedTranscriptsFilter, requestMatchedTransFilterExpandedPref, requestMatchedTransFilterExpandedUpdate, fulfillMatchedTransFilterExpanded, setDisplayedSelection, requestMatchedTransFilterSummary, fulfillMatchedTransFilterSummary} from 'wdk-client/Actions/MatchedTranscriptsFilterActions';

import { InferAction } from 'wdk-client/Utils/ActionCreatorUtils';

import { Action } from 'wdk-client/Actions';
import { Decoder, combine, field, number } from 'wdk-client/Utils/Json';
import { getMatchedTranscriptFilterPref, setMatchedTranscriptFilterPref } from 'wdk-client/Utils/UserPreferencesUtils';
import { EpicDependencies } from 'wdk-client/Core/Store';

import { mergeMapRequestActionsToEpic as mrate, takeEpicInWindow } from 'wdk-client/Utils/ActionCreatorUtils';
import { combineEpics, StateObservable } from 'redux-observable';
import { fulfillStep } from 'wdk-client/Actions/StepActions';
import { RootState } from 'wdk-client/Core/State/Types';

export const key = 'matchedTranscriptsFilter';

export type State = {
    stepId?: number,
    expanded?: boolean;
    didMeetCriteriaIsSelected: boolean;
    didNotMeetCriteriaIsSelected: boolean;
    didMeetCount?: number,
    didNotMeetCount?: number
};

const initialState: State = {
    didMeetCriteriaIsSelected: true,
    didNotMeetCriteriaIsSelected: false
};

export function reduce(state: State = initialState, action: Action): State {
    switch (action.type) {
        case openMatchedTranscriptsFilter.type: {
            return { ...state, stepId: action.payload.stepId }
        } 
        case fulfillMatchedTransFilterExpanded.type: {
            return { ...state, expanded: action.payload.expanded }
        } 
        case setDisplayedSelection.type: {
            return { ...state, didMeetCriteriaIsSelected: action.payload.didMeetCriteria,
                didNotMeetCriteriaIsSelected: action.payload.didNotMeetCriteria }
        } 
        case fulfillMatchedTransFilterSummary.type: {
            return { ...state, didMeetCount: action.payload.didMeetCount,  
                didNotMeetCount: action.payload.didNotMeetCount }
        } 
        default: {
            return state;
        }
    }
}

const openMTF = openMatchedTranscriptsFilter;

async function getRequestMatchedTransFilterExpandedPref([openAction]: [InferAction<typeof openMTF>], state$: StateObservable<RootState>, { }: EpicDependencies) : Promise<InferAction<typeof requestMatchedTransFilterExpandedPref>> {
    return requestMatchedTransFilterExpandedPref();
}

async function getFulfillMatchedTransFilterExpandedPref([requestAction]: [ InferAction<typeof requestMatchedTransFilterExpandedPref>], state$: StateObservable<RootState>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillMatchedTransFilterExpanded>> {

    let matchedTransFiltPref = await getMatchedTranscriptFilterPref(wdkService);
    return fulfillMatchedTransFilterExpanded(matchedTransFiltPref.expanded);
}

async function getFulfillMatchedTransFilterExpandedUpdate([requestAction]: [InferAction<typeof requestMatchedTransFilterExpandedUpdate>], state$: StateObservable<RootState>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillMatchedTransFilterExpanded>> {

    await setMatchedTranscriptFilterPref(requestAction.payload.expanded, wdkService);
    return fulfillMatchedTransFilterExpanded(requestAction.payload.expanded);
}

async function getRequestMatchedTransFilterSummary([openAction]: [InferAction<typeof openMTF>], state$: StateObservable<RootState>, { }: EpicDependencies) : Promise<InferAction<typeof requestMatchedTransFilterSummary>> {
    return requestMatchedTransFilterSummary(openAction.payload.stepId);
}

function filterRequestMatchedTransFilterSummary([openAction]: [InferAction<typeof openMTF>], state: RootState) {
    return !!state[key].expanded;
}

async function getRequestMatchedTransFilterSummaryStepChg([openAction, stepAction]: [InferAction<typeof openMTF>, InferAction<typeof fulfillStep>], state$: StateObservable<RootState>, { }: EpicDependencies) : Promise<InferAction<typeof requestMatchedTransFilterSummary>> {
    return requestMatchedTransFilterSummary(openAction.payload.stepId);
}

function filterRequestMatchedTransFilterSummaryStepChgActions([openAction, stepAction]: [InferAction<typeof openMTF>, InferAction<typeof fulfillStep>], state: RootState) {
    return !!state[key].expanded;
}

const MATCHED_TRANS_FILTER_NAME = "transcriptFilters.matchedTranscriptFilter";
type MatchedFilterSummary = {
    didMeetCount: number,
    didNotMeetCount: number
}

async function getFulfillMatchedTransFilterSummary([requestAction]: [InferAction<typeof requestMatchedTransFilterSummary>], state$: StateObservable<RootState>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillMatchedTransFilterSummary>> {
    let summaryDecoder : Decoder<MatchedFilterSummary> = 
    combine(field('didMeetCount', number), field('didNotMeetCount', number));
    let summary = await wdkService.getStepFilterSummary(summaryDecoder, requestAction.payload.stepId, MATCHED_TRANS_FILTER_NAME);

    return fulfillMatchedTransFilterSummary(requestAction.payload.stepId, summary.didMeetCount, summary.didNotMeetCount);
}

async function getFulfillUpdatedMatchedTransFilterSummary([requestAction]: [InferAction<typeof requestMatchedTransFilterExpandedPref>], state$: StateObservable<RootState>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillMatchedTransFilterExpanded>> {

    let matchedTransFiltPref = await getMatchedTranscriptFilterPref(wdkService);
    return fulfillMatchedTransFilterExpanded(matchedTransFiltPref.expanded);
}

/*
  open -> reqExpandedPref
  reqExpandedPref ->  fulfillExpanded
  reqExpandedUpdate -> fulfillExpanded
  fulfillExpandedPref -> reqFilterSummary   // only if expanded
  fulfillStep -> reqFilterSummary  // only if expanded.  this is not required, but if it happens need to update
*/

export const observe =
    takeEpicInWindow(
        openMTF,
        closeMatchedTranscriptsFilter,
        combineEpics(
            mrate([openMTF], getRequestMatchedTransFilterExpandedPref),
            mrate([requestMatchedTransFilterExpandedPref], getFulfillMatchedTransFilterExpandedPref),
            mrate([requestMatchedTransFilterExpandedUpdate], getFulfillMatchedTransFilterExpandedUpdate),
            mrate([openMTF], getRequestMatchedTransFilterSummary, { areActionsCoherent: filterRequestMatchedTransFilterSummary }),
            mrate([openMTF, fulfillStep], getRequestMatchedTransFilterSummaryStepChg, { areActionsCoherent: filterRequestMatchedTransFilterSummaryStepChgActions }),
        ),
    );
