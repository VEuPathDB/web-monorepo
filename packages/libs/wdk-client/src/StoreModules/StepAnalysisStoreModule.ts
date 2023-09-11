import { reduce as stepAnalysisReducer } from './StepAnalysis/StepAnalysisReducer';
import {
  observeStartLoadingTabListing,
  observeStartLoadingSavedTab,
  observeStartLoadingChosenAnalysisTab,
  observeDeleteAnalysis,
  observeStartFormSubmission,
  observeRunAnalysis,
  observeCheckResultStatus,
  observeCountDown,
  observeRenameAnalysis,
  observeDuplicateAnalysis,
  observeRemoveTab,
} from './StepAnalysis/StepAnalysisObservers';
import { StepAnalysesState } from './StepAnalysis/StepAnalysisState';
import { RootState } from '../Core/State/Types';
import { EpicDependencies } from '../Core/Store';
import { Action } from 'redux';
import { ActionsObservable, StateObservable } from 'redux-observable';
import { Subject, merge } from 'rxjs';
import { map } from 'rxjs/operators';

const key = 'stepAnalysis';
const reduce = stepAnalysisReducer;
const observe = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<RootState>,
  dependencies: EpicDependencies
) => {
  const stepAnalysisState$ = new StateObservable(
    state$.pipe(map((state) => state[key])) as Subject<StepAnalysesState>,
    state$.value[key]
  );

  return merge(
    observeStartLoadingTabListing(action$, stepAnalysisState$, dependencies),
    observeStartLoadingSavedTab(action$, stepAnalysisState$, dependencies),
    observeStartLoadingChosenAnalysisTab(
      action$,
      stepAnalysisState$,
      dependencies
    ),
    observeDeleteAnalysis(action$, stepAnalysisState$, dependencies),
    observeRemoveTab(action$, stepAnalysisState$, dependencies),
    observeStartFormSubmission(action$, stepAnalysisState$, dependencies),
    observeRunAnalysis(action$, stepAnalysisState$, dependencies),
    observeCheckResultStatus(action$, stepAnalysisState$, dependencies),
    observeCountDown(action$, stepAnalysisState$, dependencies),
    observeRenameAnalysis(action$, stepAnalysisState$, dependencies),
    observeDuplicateAnalysis(action$, stepAnalysisState$, dependencies)
  );
};

export { key, reduce, observe };
