import { get } from 'lodash';
import { ActionsObservable, combineEpics, StateObservable } from 'redux-observable';
import { Observable, empty, concat, of } from 'rxjs';
import { filter, mergeMap, mergeMapTo, tap } from 'rxjs/operators';

import { Action } from 'wdk-client/Actions';
import { openTabListing, selectSummaryView } from 'wdk-client/Actions/ResultPanelActions';
import { requestStep } from 'wdk-client/Actions/StepActions';
import { createNewTab, startLoadingTabListing } from 'wdk-client/Core/MoveAfterRefactor/Actions/StepAnalysis/StepAnalysisActionCreators';
import { question as selectQuestion } from 'wdk-client/Core/MoveAfterRefactor/StoreModules/StepAnalysis/StepAnalysisSelectors';
import { RootState } from 'wdk-client/Core/State/Types';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { indexByActionProperty } from 'wdk-client/Utils/ReducerUtils';
import { prefSpecs } from 'wdk-client/Utils/UserPreferencesUtils';
import { ANALYSIS_MENU_STATE } from 'wdk-client/Core/MoveAfterRefactor/StoreModules/StepAnalysis/StepAnalysisState';

export type ResultPanelState = {
  activeSummaryView: string | null;
};

const initialState = {
  activeSummaryView: null
};

export const key = 'resultPanel';

export const ANALYSIS_MENU_ID = 'analysis-menu';

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
  observeOpenTabListing,
  observeSelectSummaryView
);

function observeOpenTabListing(action$: ActionsObservable<Action>, state$: StateObservable<RootState>, dependencies: EpicDependencies): Observable<Action> {
  return action$.pipe(
    filter(openTabListing.isOfType),
    mergeMap(action => concat(
      of(requestStep(action.payload.stepId)),
      action.payload.viewId === 'strategy' ? of(startLoadingTabListing(action.payload.stepId)) : empty(),
      action.payload.initialTab === ANALYSIS_MENU_ID ? of(createNewTab(
        {
          type: ANALYSIS_MENU_STATE,
          displayName: 'New Analysis',
          status: 'AWAITING_USER_CHOICE',
          errorMessage: null 
        }
      )) : empty()
    ))
  );
}

function observeSelectSummaryView(action$: ActionsObservable<Action>, state$: StateObservable<RootState>, { wdkService }: EpicDependencies): Observable<Action> {
  return action$.pipe(
    filter(selectSummaryView.isOfType),
    tap(action => {
      const question = selectQuestion(state$.value, { stepId: action.payload.stepId, viewId: action.payload.viewId });
      if (question == null) return;

      const [ scope, key ] = prefSpecs.resultPanelTab(question.fullName);
      wdkService.patchSingleUserPreference(scope, key, action.payload.summaryView);
    }),
    mergeMapTo(empty())
  )
}
