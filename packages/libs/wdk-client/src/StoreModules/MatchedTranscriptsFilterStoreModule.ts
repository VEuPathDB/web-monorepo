import { openMatchedTranscriptsFilter, closeMatchedTranscriptsFilter, requestMatchedTransFilterExpandedPref, requestMatchedTransFilterExpandedUpdate, fulfillMatchedTransFilterExpanded, setDisplayedSelection, requestMatchedTransFilterSummary, fulfillMatchedTransFilterSummary} from 'wdk-client/Actions/MatchedTranscriptsFilterActions';

import { InferAction } from 'wdk-client/Utils/ActionCreatorUtils';

import { Action } from 'wdk-client/Actions';
import { Decoder, combine, field, number } from 'wdk-client/Utils/Json';
import { getMatchedTranscriptFilterPref, setMatchedTranscriptFilterPref } from 'wdk-client/Utils/UserPreferencesUtils';
import { EpicDependencies } from 'wdk-client/Core/Store';

import { Observable } from 'rxjs';
import {mapRequestActionsToEpic, takeEpicInWindow} from 'wdk-client/Utils/ActionCreatorUtils';
import { combineEpics, StateObservable} from 'redux-observable';
import { fulfillStep } from 'wdk-client/Actions/StepActions';

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

async function getRequestMatchedTransFilterExpandedPref([openAction]: [InferAction<typeof openMTF>], state$: Observable<State>, { }: EpicDependencies) : Promise<InferAction<typeof requestMatchedTransFilterExpandedPref>> {
    return requestMatchedTransFilterExpandedPref();
}

async function getFulfillMatchedTransFilterExpandedPref([requestAction]: [ InferAction<typeof requestMatchedTransFilterExpandedPref>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillMatchedTransFilterExpanded>> {

    let matchedTransFiltPref = await getMatchedTranscriptFilterPref(wdkService);
    return fulfillMatchedTransFilterExpanded(matchedTransFiltPref.expanded);
}

async function getFulfillMatchedTransFilterExpandedUpdate([requestAction]: [InferAction<typeof requestMatchedTransFilterExpandedUpdate>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillMatchedTransFilterExpanded>> {

    await setMatchedTranscriptFilterPref(requestAction.payload.expanded, wdkService);
    return fulfillMatchedTransFilterExpanded(requestAction.payload.expanded);
}

async function getRequestMatchedTransFilterSummary([openAction]: [InferAction<typeof openMTF>], state$: StateObservable<State>, { }: EpicDependencies) : Promise<InferAction<typeof requestMatchedTransFilterSummary> | undefined> {
    
    if (!state$.value.expanded) return undefined;
    return requestMatchedTransFilterSummary(openAction.payload.stepId);
}

async function getRequestMatchedTransFilterSummaryStepChg([openAction, stepAction]: [InferAction<typeof openMTF>, InferAction<typeof fulfillStep>], state$: StateObservable<State>, { }: EpicDependencies) : Promise<InferAction<typeof requestMatchedTransFilterSummary> | undefined> {
    if (!state$.value.expanded) return undefined;
    if (openAction.payload.stepId != stepAction.payload.step.id) return undefined;
    return requestMatchedTransFilterSummary(openAction.payload.stepId);
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

const mrate = mapRequestActionsToEpic;

export const observe =
    takeEpicInWindow<State>(
        openMTF,
        closeMatchedTranscriptsFilter,
        combineEpics(
            mrate([openMTF], getRequestMatchedTransFilterExpandedPref),
            mrate([requestMatchedTransFilterExpandedPref], getFulfillMatchedTransFilterExpandedPref),
            mrate([requestMatchedTransFilterExpandedUpdate], getFulfillMatchedTransFilterExpandedUpdate),
            mrate([openMTF], getRequestMatchedTransFilterSummary),
            mrate([openMTF, fulfillStep], getRequestMatchedTransFilterSummaryStepChg),
        ),
    );
