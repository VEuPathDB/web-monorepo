import { openMatchedTranscriptsFilterAction, requestMatchedTransFilterExpandedPref, requestMatchedTransFilterExpandedUpdate, fulfillMatchedTransFilterExpanded, setDisplayedSelection, requestMatchedTransFilterSummary, fulfillMatchedTransFilterSummary} from 'wdk-client/Actions/MatchedTranscriptsFilterActions';

import { InferAction } from 'wdk-client/Utils/ActionCreatorUtils';

import { Action } from 'wdk-client/Actions';
import { Decoder, combine, field, number } from 'wdk-client/Utils/Json';
import { getMatchedTranscriptFilterPref, setMatchedTranscriptFilterPref } from 'wdk-client/Utils/UserPreferencesUtils';
import { EpicDependencies } from 'wdk-client/Core/Store';

import { Observable } from 'rxjs';
import {mapRequestActionsToEpic} from 'wdk-client/Utils/ActionCreatorUtils';
import { combineEpics} from 'redux-observable';

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
        case openMatchedTranscriptsFilterAction.type: {
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

// these guys probably belong in user preference land
async function getRequestMatchedTransFilterExpandedPref([requestAction]: [InferAction<typeof openMatchedTranscriptsFilterAction>], state$: Observable<State>, { }: EpicDependencies) : Promise<InferAction<typeof requestMatchedTransFilterExpandedPref>> {
    return requestMatchedTransFilterExpandedPref();
}

async function getFulfillMatchedTransFilterExpandedPref([requestAction]: [InferAction<typeof requestMatchedTransFilterExpandedPref>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillMatchedTransFilterExpanded>> {

    let matchedTransFiltPref = await getMatchedTranscriptFilterPref(wdkService);
    return fulfillMatchedTransFilterExpanded(matchedTransFiltPref.expanded);
}

async function getFulfillMatchedTransFilterExpandedUpdate([requestAction]: [InferAction<typeof requestMatchedTransFilterExpandedUpdate>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillMatchedTransFilterExpanded>> {

    await setMatchedTranscriptFilterPref(requestAction.payload.expanded, wdkService);
    return fulfillMatchedTransFilterExpanded(requestAction.payload.expanded);
}

async function getRequestMatchedTransFilterSummary([requestAction]: [InferAction<typeof openMatchedTranscriptsFilterAction>], state$: Observable<State>, { }: EpicDependencies) : Promise<InferAction<typeof requestMatchedTransFilterSummary>> {
    return requestMatchedTransFilterSummary(requestAction.payload.stepId);
}

const MATCHED_TRANS_FILTER_NAME = "transcriptFilters.matchedTranscriptFilter";
type MatchedFilterSummary = {
    didMeetCount: number,
    didNotMeetCount: number
}

async function getFulfillMatchedTransFilterSummary([requestAction]: [InferAction<typeof requestMatchedTransFilterSummary>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillMatchedTransFilterSummary>> {
    let summaryDecoder : Decoder<MatchedFilterSummary> = 
    combine(field('didMeetCount', number), field('didNotMeetCount', number));
    let summary = await wdkService.getStepFilterSummary(summaryDecoder, requestAction.payload.stepId, MATCHED_TRANS_FILTER_NAME);

    return fulfillMatchedTransFilterSummary(requestAction.payload.stepId, summary.didMeetCount, summary.didNotMeetCount);
}

async function getFulfillUpdatedMatchedTransFilterSummary([requestAction]: [InferAction<typeof requestMatchedTransFilterExpandedPref>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillMatchedTransFilterExpanded>> {

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