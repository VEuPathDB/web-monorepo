import { get } from 'lodash';
import { ActionsObservable, combineEpics, StateObservable } from 'redux-observable';
import { Observable, empty, concat, of, from } from 'rxjs';
import { filter, mergeMap, mergeMapTo, tap } from 'rxjs/operators';

import { Action } from 'wdk-client/Actions';
import { openTabListing, selectSummaryView, setResultTypeDetails } from 'wdk-client/Actions/ResultPanelActions';
import { createNewTab, startLoadingTabListing } from '../Actions/StepAnalysis/StepAnalysisActionCreators';
import { question as selectQuestion } from './StepAnalysis/StepAnalysisSelectors';
import { RootState } from 'wdk-client/Core/State/Types';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { indexByActionProperty } from 'wdk-client/Utils/ReducerUtils';
import { prefSpecs } from 'wdk-client/Utils/UserPreferencesUtils';
import { ANALYSIS_MENU_STATE } from './StepAnalysis/StepAnalysisState';
import { ResultTypeDetails, getResultTypeDetails } from 'wdk-client/Utils/WdkResult';

export type ResultPanelState = {
  activeSummaryView: string | null;
  resultTypeDetails?: ResultTypeDetails
};

const initialState = {
  activeSummaryView: null
};

export const key = 'resultPanel';

export const ANALYSIS_MENU_ID = 'stepAnalysis:menu';

const reduceResultPanel = (state: ResultPanelState = initialState, action: Action): ResultPanelState => {
  switch (action.type) {
    case selectSummaryView.type:
      return {
        ...state,
        activeSummaryView: action.payload.summaryView
      };

    case setResultTypeDetails.type:
      return {
        ...state,
        resultTypeDetails: action.payload.resultTypeDetails
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
    mergeMap(action => {
      const { resultType, initialTab, viewId } = action.payload;
      return concat(
        from(getResultTypeDetails(dependencies.wdkService, resultType)
          .then(resultTypeDetails => setResultTypeDetails(viewId, resultTypeDetails))),
        resultType.type === 'step' ? of(startLoadingTabListing(resultType.step.strategyId, resultType.step.id)) : empty(),
        initialTab === ANALYSIS_MENU_ID ? of(createNewTab(
          {
            type: ANALYSIS_MENU_STATE,
            displayName: 'New Analysis',
            status: 'AWAITING_USER_CHOICE',
            errorMessage: null
          }
        )) : empty()
      )
    })
  );
}

function observeSelectSummaryView(action$: ActionsObservable<Action>, state$: StateObservable<RootState>, { wdkService }: EpicDependencies): Observable<Action> {
  return action$.pipe(
    filter(selectSummaryView.isOfType),
    tap(action => {
      const { resultType, viewId, summaryView } = action.payload;
      if (resultType.type !== 'step') return;

      const question = selectQuestion(state$.value, { resultType, viewId });

      if (question == null) return;

      const [scope, key] = prefSpecs.resultPanelTab(question.fullName);
      wdkService.patchSingleUserPreference(scope, key, summaryView);
    }),
    mergeMapTo(empty())
  )
}
