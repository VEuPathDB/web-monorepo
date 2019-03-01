import { isEqual } from 'lodash';
import {
  openMatchedTranscriptsFilter,
  closeMatchedTranscriptsFilter,
  requestMatchedTransFilterExpandedPref,
  requestMatchedTransFilterExpandedUpdate,
  fulfillMatchedTransFilterExpanded,
  requestMatchedTransFilterSummary,
  fulfillMatchedTransFilterSummary,
  requestMatchedTransFilterUpdate,
  setDisplayedSelection
} from 'wdk-client/Actions/MatchedTranscriptsFilterActions';

import { InferAction } from 'wdk-client/Utils/ActionCreatorUtils';

import { Action } from 'wdk-client/Actions';
import { Decoder, combine, field, number, optional } from 'wdk-client/Utils/Json';
import {
  getMatchedTranscriptFilterPref,
  setMatchedTranscriptFilterPref
} from 'wdk-client/Utils/UserPreferencesUtils';
import { EpicDependencies } from 'wdk-client/Core/Store';

import {
  mergeMapRequestActionsToEpic as mrate,
  takeEpicInWindow
} from 'wdk-client/Utils/ActionCreatorUtils';
import { combineEpics, StateObservable } from 'redux-observable';
import { fulfillStep, requestStep, requestStepUpdate } from 'wdk-client/Actions/StepActions';
import { RootState } from 'wdk-client/Core/State/Types';
import { Step } from 'wdk-client/Utils/WdkUser';

export interface FilterValue {
  values: Array<'Y'|'N'>;
}

export const key = 'matchedTranscriptsFilter';

export type State = {
  stepId?: number;
  expanded?: boolean;
  didMeetCount?: number;
  didNotMeetCount?: number;
  didMeetCriteria?: boolean;
  didNotMeetCriteria?: boolean;
};

const initialState: State = { };

export function reduce(state: State = initialState, action: Action): State {
  switch (action.type) {
    case openMatchedTranscriptsFilter.type: {
      return { ...state, stepId: action.payload.stepId };
    }
    case fulfillMatchedTransFilterExpanded.type: {
      return { ...state, expanded: action.payload.expanded };
    }
    case fulfillMatchedTransFilterSummary.type: {
      return {
        ...state,
        didMeetCount: action.payload.didMeetCount,
        didNotMeetCount: action.payload.didNotMeetCount
      };
    }
    case setDisplayedSelection.type: {
      return {
        ...state,
        ...action.payload
      };
    }
    default: {
      return state;
    }
  }
}

const openMTF = openMatchedTranscriptsFilter;

async function getRequestStep(
  [openAction]: [InferAction<typeof openMTF>],
  state$: StateObservable<RootState>,
  { }: EpicDependencies
) {
  return requestStep(openAction.payload.stepId);
}

async function getRequestMatchedTransFilterExpandedPref(
  [openAction]: [InferAction<typeof openMTF>],
  state$: StateObservable<RootState>,
  {  }: EpicDependencies
): Promise<InferAction<typeof requestMatchedTransFilterExpandedPref>> {
  return requestMatchedTransFilterExpandedPref();
}

async function getFulfillMatchedTransFilterExpandedPref(
  [requestAction]: [InferAction<typeof requestMatchedTransFilterExpandedPref>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillMatchedTransFilterExpanded>> {
  let matchedTransFiltPref = await getMatchedTranscriptFilterPref(wdkService);
  return fulfillMatchedTransFilterExpanded(matchedTransFiltPref.expanded);
}

async function getFulfillMatchedTransFilterExpandedUpdate(
  [requestAction]: [
    InferAction<typeof requestMatchedTransFilterExpandedUpdate>
  ],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillMatchedTransFilterExpanded>> {
  setMatchedTranscriptFilterPref(
    requestAction.payload.expanded,
    wdkService
  );
  return fulfillMatchedTransFilterExpanded(requestAction.payload.expanded);
}

async function getRequestMatchedTransFilterSummary(
  [openAction]: [InferAction<typeof openMTF>],
  state$: StateObservable<RootState>,
  {  }: EpicDependencies
): Promise<InferAction<typeof requestMatchedTransFilterSummary>> {
  return requestMatchedTransFilterSummary(openAction.payload.stepId);
}

function filterRequestMatchedTransFilterSummary(
  [openAction]: [InferAction<typeof openMTF>],
  state: RootState
) {
  return !!state[key].expanded;
}

async function getRequestMatchedTransFilterSummaryStepChg(
  [openAction, stepAction]: [
    InferAction<typeof openMTF>,
    InferAction<typeof fulfillStep>
  ],
  state$: StateObservable<RootState>,
  {  }: EpicDependencies
): Promise<InferAction<typeof requestMatchedTransFilterSummary>> {
  return requestMatchedTransFilterSummary(openAction.payload.stepId);
}

function filterRequestMatchedTransFilterSummaryStepChgActions(
  [openAction, stepAction]: [
    InferAction<typeof openMTF>,
    InferAction<typeof fulfillStep>
  ],
  state: RootState
) {
  return !!state[key].expanded;
}

export const MATCHED_TRANS_FILTER_NAME = 'matched_transcript_filter_array';
type MatchedFilterSummary = {
  Y?: number;
  N?: number;
};

async function getFulfillMatchedTransFilterSummary(
  [requestAction]: [InferAction<typeof requestMatchedTransFilterSummary>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillMatchedTransFilterSummary>> {
  let summaryDecoder: Decoder<MatchedFilterSummary> = combine(
    field('Y', optional(number)),
    field('N', optional(number))
  );
  let summary = await wdkService.getStepFilterSummary(
    summaryDecoder,
    requestAction.payload.stepId,
    MATCHED_TRANS_FILTER_NAME
  );

  return fulfillMatchedTransFilterSummary(
    requestAction.payload.stepId,
    summary.Y || 0,
    summary.N || 0
  );
}

async function getFulfillUpdatedMatchedTransFilterSummary(
  [requestAction]: [InferAction<typeof requestMatchedTransFilterExpandedPref>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillMatchedTransFilterExpanded>> {
  let matchedTransFiltPref = await getMatchedTranscriptFilterPref(wdkService);
  return fulfillMatchedTransFilterExpanded(matchedTransFiltPref.expanded);
}

async function getRequestStepUpdate(
  [openAction, stepAction, updateFilterAction]: [InferAction<typeof openMTF>, InferAction<typeof fulfillStep>, InferAction<typeof requestMatchedTransFilterUpdate>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof requestStepUpdate>> {
  const { answerSpec } = stepAction.payload.step;
  const filterValue = updateFilterActionToFilterValue(updateFilterAction);
  return requestStepUpdate(
    openAction.payload.stepId,
    {
      answerSpec: {
        ...answerSpec,
        filters: (answerSpec.filters || [])
          .map(filter => filter.name === MATCHED_TRANS_FILTER_NAME
            ? { ...filter, value: filterValue }
            : filter
          )
      }
    }
  );
}

function filterStepUpdateActions([openAction, stepAction, updateFilterAction]: [InferAction<typeof openMTF>, InferAction<typeof fulfillStep>, InferAction<typeof requestMatchedTransFilterUpdate>]) {
  return openAction.payload.stepId === stepAction.payload.step.id;
}

function areStepUpdateActionsNew(
  [openAction, stepAction, updateFilterAction]: [InferAction<typeof openMTF>, InferAction<typeof fulfillStep>, InferAction<typeof requestMatchedTransFilterUpdate>],
  [prevOpenAction, prevStepAction, prevUpdateFilterAction]: [InferAction<typeof openMTF>, InferAction<typeof fulfillStep>, InferAction<typeof requestMatchedTransFilterUpdate>]
) {
  return !isEqual(
    updateFilterAction.payload,
    prevUpdateFilterAction.payload
  );
}

function updateFilterActionToFilterValue(updateFilterAction: InferAction<typeof requestMatchedTransFilterUpdate>) {
  const { didMeetCriteria, didNotMeetCriteria } = updateFilterAction.payload;
  const values: Array<'Y'|'N'> = [];
  if (didMeetCriteria) values.push('Y');
  if (didNotMeetCriteria) values.push('N');
  return { values };
}

export function getFilterValue(step?: Step): FilterValue | undefined {
  if (step == null || step.answerSpec.filters == null) return;
  const filter = step.answerSpec.filters.find(filter => filter.name === MATCHED_TRANS_FILTER_NAME);
  return filter && filter.value;
}

export const observe = takeEpicInWindow(
  openMTF,
  closeMatchedTranscriptsFilter,
  combineEpics(
    mrate([openMTF], getRequestStep),
    mrate([openMTF], getRequestMatchedTransFilterExpandedPref),
    mrate( [requestMatchedTransFilterExpandedPref], getFulfillMatchedTransFilterExpandedPref),
    mrate( [requestMatchedTransFilterExpandedUpdate], getFulfillMatchedTransFilterExpandedUpdate),
    mrate([openMTF], getRequestMatchedTransFilterSummary,
    /*{ areActionsCoherent: filterRequestMatchedTransFilterSummary }*/),
    mrate([requestMatchedTransFilterSummary], getFulfillMatchedTransFilterSummary),
    mrate([openMTF, fulfillStep], getRequestMatchedTransFilterSummaryStepChg,
      { areActionsCoherent: filterRequestMatchedTransFilterSummaryStepChgActions }),
    mrate([requestMatchedTransFilterExpandedPref], getFulfillUpdatedMatchedTransFilterSummary),
    mrate([openMTF, fulfillStep, requestMatchedTransFilterUpdate], getRequestStepUpdate,
      { areActionsCoherent: filterStepUpdateActions, areActionsNew: areStepUpdateActionsNew })
  )
);
