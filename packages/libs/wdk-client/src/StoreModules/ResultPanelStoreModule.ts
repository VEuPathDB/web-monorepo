import { Action } from 'wdk-client/Actions';

import { get } from 'lodash';

import { 
  Action as ResultPanelActions,
  openTabListing,
  selectSummaryView
} from 'wdk-client/Actions/ResultPanelActions';

import {
  questionsLoaded
} from 'wdk-client/Actions/StaticDataActions';

import {
  requestStep, fulfillStep
} from 'wdk-client/Actions/StepActions';

import { EpicDependencies } from 'wdk-client/Core/Store';

import { RootState } from 'wdk-client/Core/State/Types';

import { combineEpics, ActionsObservable, StateObservable } from 'redux-observable';
import { filter, mergeMap } from 'rxjs/operators';
import { startLoadingTabListing } from 'wdk-client/Core/MoveAfterRefactor/Actions/StepAnalysis/StepAnalysisActionCreators';
import { indexByActionProperty } from 'wdk-client/Utils/ReducerUtils';

export type ResultPanelState = {
  stepId: number;
  activeSummaryView: string | null;
};

const initialState = {
  stepId: -1,
  activeSummaryView: null
};

export const key = 'resultPanel';

const reduceResultPanel = (state: ResultPanelState = initialState, action: Action): ResultPanelState => {
  switch (action.type) {
    case selectSummaryView.type:
      return {
        ...state,
        activeSummaryView: action.payload.summaryView
      };

    default:
      return state;
  }
};

export const reduce = indexByActionProperty(
  reduceResultPanel,
  action => get(action, ['payload', 'viewId'])
)

export const observe = combineEpics(
  observeOpenTabListing
);

function observeOpenTabListing(action$: ActionsObservable<Action>, state$: StateObservable<RootState>, dependencies: EpicDependencies) {
  return action$.pipe(
    mergeMap(
      // TODO: Figure out why the payload type isn't being inferred from filter(openTabListing.isOfType)
      action => action.type !== openTabListing.type
        ? []
        : [ startLoadingTabListing(action.payload.stepId), requestStep(action.payload.stepId) ])
  );
}
