import {
  UNINITIALIZED_PANEL_STATE,
  ANALYSIS_MENU_STATE,
  UNSAVED_ANALYSIS_STATE,
  SAVED_ANALYSIS_STATE,
  AnalysisPanelState,
  StepAnalysesState,
  UninitializedAnalysisPanelState,
  AnalysisMenuState,
  UnsavedAnalysisState,
  SavedAnalysisState,
} from './StepAnalysisState';
import {
  START_LOADING_TAB_LISTING,
  SELECT_TAB,
  START_LOADING_SAVED_TAB,
  START_LOADING_CHOSEN_ANALYSIS_TAB,
  DELETE_ANALYSIS,
  START_FORM_SUBMISSION,
  RUN_ANALYSIS,
  CHECK_RESULT_STATUS,
  COUNT_DOWN,
  RENAME_ANALYSIS,
  DUPLICATE_ANALYSIS,
  REMOVE_TAB,
} from '../../Actions/StepAnalysis/StepAnalysisActionConstants';
import {
  StartLoadingTabListingAction,
  SelectTabAction,
  StartLoadingSavedTabAction,
  StartLoadingChosenAnalysisTabAction,
  DeleteAnalysisAction,
  StartFormSubmissionAction,
  RunAnalysisAction,
  CheckResultStatusAction,
  CountDownAction,
  RenameAnalysisAction,
  DuplicateAnalysisAction,
  RemoveTabAction,
} from '../../Actions/StepAnalysis/StepAnalysisActions';
import { ActionsObservable, StateObservable } from 'redux-observable';
import { Action } from 'redux';
import { EpicDependencies } from '../../Core/Store';
import { EMPTY, of } from 'rxjs';
import {
  map,
  filter,
  mergeMap,
  withLatestFrom,
  delay,
  mergeAll,
} from 'rxjs/operators';
import {
  finishLoadingTabListing,
  startLoadingSavedTab,
  finishLoadingSavedTab,
  finishLoadingChosenAnalysisTab,
  removeTab,
  countDown,
  renameTab,
  createNewTab,
  startFormSubmission,
  runAnalysis,
  checkResultStatus,
  finishFormSubmission,
  selectTab,
} from '../../Actions/StepAnalysis/StepAnalysisActionCreators';

import { transitionToInternalPage } from '../../Actions/RouterActions';
import { StepAnalysisType } from '../../Utils/StepAnalysisUtils';
import { InvalidStepValidation, extractParamValues } from '../../Utils/WdkUser';

export const observeStartLoadingTabListing = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<StepAnalysesState>,
  { wdkService }: EpicDependencies
) => {
  return action$.pipe(
    filter(isStartLoadingTabListing),
    withLatestFrom(state$, (_, { stepId }) => stepId),
    mergeMap(async (stepId) => {
      try {
        const appliedAnalyses = await wdkService.getAppliedStepAnalyses(stepId);
        const choices = await wdkService.getStepAnalysisTypes(stepId);
        const tabListing = appliedAnalyses.map(
          (analysis): UninitializedAnalysisPanelState => ({
            type: UNINITIALIZED_PANEL_STATE,
            status: 'UNOPENED',
            errorMessage: null,
            ...analysis,
          })
        );

        return state$.value.stepId === stepId
          ? of(finishLoadingTabListing(tabListing, choices))
          : EMPTY;
      } catch (ex) {
        return EMPTY;
      }
    }),
    mergeAll()
  );
};

export const observeSelectTab = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<StepAnalysesState>,
  dependencies: EpicDependencies
) => {
  return action$.pipe(
    filter(isSelectTab),
    withLatestFrom(state$, focusOnPanelById),
    filter(onTabInUnitializedAnalysisPanelState),
    map(({ panelId }) => startLoadingSavedTab(panelId))
  );
};

export const observeStartLoadingSavedTab = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<StepAnalysesState>,
  { wdkService }: EpicDependencies
) => {
  return action$.pipe(
    filter(isStartLoadingSavedTab),
    withLatestFrom(state$, focusOnPanelById),
    filter(onTabInUnitializedAnalysisPanelState),
    mergeMap(async ({ choices, stepId, panelId, panelState }) => {
      const analysisId = panelState.analysisId;
      try {
        const analysisConfig = await wdkService.getStepAnalysis(
          stepId,
          analysisId
        );
        const resultContents =
          analysisConfig.status === 'COMPLETE'
            ? await wdkService.getStepAnalysisResult(stepId, analysisId)
            : {};
        const isAutorun = determineIfAutorun(
          analysisConfig.analysisName,
          choices
        );
        const finishLoading = finishLoadingSavedTab(panelId, {
          type: SAVED_ANALYSIS_STATE,
          analysisConfig,
          analysisConfigStatus: 'COMPLETE',
          pollCountdown: 3,
          paramSpecs: analysisConfig.displayParams,
          paramValues: analysisConfig.parameters,
          panelUiState: {
            descriptionExpanded: false,
            formExpanded: true,
          },
          formStatus: 'AWAITING_USER_SUBMISSION',
          formErrorMessage: null,
          formValidationErrors: [],
          resultContents,
          resultErrorMessage: null,
        });

        switch (analysisConfig.status) {
          // continue to monitor status
          case 'RUNNING':
          case 'PENDING':
            return [finishLoading, checkResultStatus(panelId)];

          // resubmit form for auto-runnable analyses when in state non-error like state
          case 'CREATED':
          case 'STEP_REVISED':
          case 'INTERRUPTED':
          case 'EXPIRED':
          case 'OUT_OF_DATE':
            return isAutorun
              ? [finishLoading, startFormSubmission(panelId)]
              : [finishLoading];

          // just finish for everything else
          default:
            return [finishLoading];
        }
      } catch (ex) {
        return finishLoadingSavedTab(panelId, {
          ...panelState,
          status: 'ERROR',
          errorMessage: 'response' in ex ? ex.response : String(ex),
        });
      }
    })
  );
};

export const observeStartLoadingChosenAnalysisTab = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<StepAnalysesState>,
  { wdkService }: EpicDependencies
) => {
  return action$.pipe(
    filter(isStartLoadingChosenAnalysisTab),
    withLatestFrom(state$, focusOnPanelById),
    filter(onTabInAnalysisMenuState),
    mergeMap(
      async ({
        action: {
          payload: { choice },
        },
        panelId,
        stepId,
        panelState,
      }) => {
        try {
          const paramSpecs = await wdkService.getStepAnalysisTypeParamSpecs(
            stepId,
            choice.name
          );

          const finishLoading = finishLoadingChosenAnalysisTab(panelId, {
            type: UNSAVED_ANALYSIS_STATE,
            displayName: choice.displayName,
            analysisName: choice.displayName,
            analysisType: choice,
            pollCountdown: 0,
            paramSpecs,
            paramValues: extractParamValues(paramSpecs),
            panelUiState: {
              descriptionExpanded: false,
              formExpanded: true,
            },
            formErrorMessage: null,
            formValidationErrors: [],
            formStatus: 'AWAITING_USER_SUBMISSION',
          });

          return choice.paramNames.length > 0
            ? [finishLoading]
            : [finishLoading, startFormSubmission(panelId)];
        } catch (ex) {
          const { isValidationError, errorMessage } =
            parseAnalysisInitializationError(ex);

          if (!isValidationError) {
            wdkService.submitErrorIfNot500(ex);
          }

          return [
            finishLoadingChosenAnalysisTab(panelId, {
              ...panelState,
              status: 'ERROR',
              errorMessage,
            }),
          ];
        }
      }
    ),
    mergeAll()
  );
};

export const observeDeleteAnalysis = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<StepAnalysesState>,
  { wdkService }: EpicDependencies
) => {
  return action$.pipe(
    filter(isDeleteAnalysis),
    withLatestFrom(state$, focusOnPanelById),
    mergeMap(async ({ panelId, stepId, panelState }) => {
      if (panelState.type === ANALYSIS_MENU_STATE) {
        return [removeTab(panelId)];
      }

      if (
        !confirm(
          'Are you sure you want to delete this analysis? You will not be able to retrieve it later.'
        )
      ) {
        return EMPTY;
      }

      if (panelState.type !== UNSAVED_ANALYSIS_STATE) {
        const { analysisId } =
          panelState.type === UNINITIALIZED_PANEL_STATE
            ? panelState
            : panelState.analysisConfig;

        wdkService.deleteStepAnalysis(stepId, analysisId);
      }

      return [removeTab(panelId)];
    }),
    mergeAll()
  );
};

export const observeRemoveTab = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<StepAnalysesState>,
  dependencies: EpicDependencies
) => {
  return action$.pipe(
    filter(isRemoveTab),
    withLatestFrom(state$, focusOnPanelById),
    map(({ panelId, stepId, panelState }) => selectTab(state$.value.activeTab))
  );
};

export const observeStartFormSubmission = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<StepAnalysesState>,
  { wdkService }: EpicDependencies
) => {
  return action$.pipe(
    filter(isStartFormSubmission),
    withLatestFrom(state$, focusOnPanelById),
    filter(onTabInRunnableState),
    mergeMap(async ({ panelId, panelState, stepId, strategyId }) => {
      const displayName =
        panelState.type === UNSAVED_ANALYSIS_STATE
          ? panelState.displayName
          : panelState.analysisConfig.displayName;

      if (panelState.type === UNSAVED_ANALYSIS_STATE) {
        const analysisConfig = await wdkService.createStepAnalysis(stepId, {
          analysisName: panelState.analysisType.name,
          displayName,
          parameters: panelState.paramValues,
        });

        return [
          transitionToInternalPage(
            `/workspace/strategies/${strategyId}/${stepId}/analysis:${analysisConfig.analysisId}`,
            { replace: true }
          ),
          finishLoadingSavedTab(panelId, {
            type: SAVED_ANALYSIS_STATE,
            paramSpecs: panelState.paramSpecs,
            paramValues: panelState.paramValues,
            formStatus: panelState.formStatus,
            formErrorMessage: panelState.formErrorMessage,
            formValidationErrors: panelState.formValidationErrors,
            panelUiState: panelState.panelUiState,
            analysisConfig,
            analysisConfigStatus: 'COMPLETE',
            pollCountdown: 3,
            resultContents: {},
            resultErrorMessage: null,
          }),
          runAnalysis(panelId),
        ];
      } else {
        await wdkService.updateStepAnalysisForm(
          stepId,
          panelState.analysisConfig.analysisId,
          panelState.paramValues
        );

        return [runAnalysis(panelId)];
      }
    }),
    mergeAll()
  );
};

export const observeRunAnalysis = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<StepAnalysesState>,
  { wdkService }: EpicDependencies
) => {
  return action$.pipe(
    filter(isRunAnalysis),
    withLatestFrom(state$, focusOnPanelById),
    filter(onTabInSavedState),
    mergeMap(async ({ panelId, panelState, stepId }) => {
      const { status } = await wdkService.runStepAnalysis(
        stepId,
        panelState.analysisConfig.analysisId
      );

      return [
        finishFormSubmission(panelId, {
          ...panelState,
          analysisConfig: {
            ...panelState.analysisConfig,
            status,
          },
          analysisConfigStatus: 'LOADING',
          formValidationErrors: [],
        }),
        checkResultStatus(panelId),
      ];
    }),
    mergeAll()
  );
};

export const observeCheckResultStatus = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<StepAnalysesState>,
  { wdkService }: EpicDependencies
) => {
  return action$.pipe(
    filter(isCheckResultStatus),
    withLatestFrom(state$, focusOnPanelById),
    filter(onTabInSavedState),
    mergeMap(async ({ stepId, panelId, panelState }) => {
      try {
        const analysisId = panelState.analysisConfig.analysisId;
        const { status } = await wdkService.getStepAnalysisStatus(
          stepId,
          analysisId
        );

        if (status === 'PENDING' || status === 'RUNNING') {
          return countDown(panelId);
        }

        const resultContents =
          status === 'COMPLETE'
            ? await wdkService.getStepAnalysisResult(stepId, analysisId)
            : {};

        return finishFormSubmission(panelId, {
          ...panelState,
          analysisConfig: {
            ...panelState.analysisConfig,
            status,
          },
          analysisConfigStatus: 'COMPLETE',
          formStatus: 'AWAITING_USER_SUBMISSION',
          formErrorMessage: null,
          formValidationErrors: [],
          resultContents,
          resultErrorMessage: null,
        });
      } catch (ex) {
        return finishFormSubmission(panelId, {
          ...panelState,
          resultErrorMessage: `An error occurred while trying to run your analysis: ${ex}`,
          analysisConfigStatus: 'ERROR',
        });
      }
    })
  );
};

export const observeCountDown = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<StepAnalysesState>,
  dependencies: EpicDependencies
) => {
  return action$.pipe(
    filter(isCountDown),
    withLatestFrom(state$, focusOnPanelById),
    filter(onTabInRunnableState),
    delay(1000),
    map(({ panelId, panelState }) =>
      panelState.pollCountdown > 0
        ? countDown(panelId)
        : checkResultStatus(panelId)
    )
  );
};

export const observeRenameAnalysis = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<StepAnalysesState>,
  { wdkService }: EpicDependencies
) => {
  return action$.pipe(
    filter(isRenameAnalysis),
    withLatestFrom(state$, focusOnPanelById),
    filter(onTabInRunnableState),
    mergeMap(
      async ({
        action: {
          payload: { panelId, newDisplayName },
        },
        stepId,
        panelState,
      }) => {
        if (panelState.type === SAVED_ANALYSIS_STATE) {
          await wdkService.renameStepAnalysis(
            stepId,
            panelState.analysisConfig.analysisId,
            newDisplayName
          );
        }

        return renameTab(panelId, newDisplayName);
      }
    )
  );
};

export const observeDuplicateAnalysis = (
  action$: ActionsObservable<Action>,
  state$: StateObservable<StepAnalysesState>,
  { wdkService }: EpicDependencies
) => {
  return action$.pipe(
    filter(isDuplicateAnalysis),
    withLatestFrom(state$, focusOnPanelById),
    filter(onTabInRunnableState),
    mergeMap(async ({ choices, stepId, panelState }) => {
      if (panelState.type === UNSAVED_ANALYSIS_STATE) {
        return createNewTab(panelState);
      }

      const displayName = panelState.analysisConfig.displayName;
      const isAutorun = determineIfAutorun(
        panelState.analysisConfig.analysisName,
        choices
      );

      if (isAutorun) {
        const duplicateAnalysisConfig = await wdkService.createStepAnalysis(
          stepId,
          {
            analysisName: panelState.analysisConfig.analysisName,
            displayName,
            parameters: panelState.paramValues,
          }
        );

        return createNewTab({
          type: UNINITIALIZED_PANEL_STATE,
          analysisId: duplicateAnalysisConfig.analysisId,
          displayName: duplicateAnalysisConfig.displayName,
          status: 'UNOPENED',
          errorMessage: null,
        });
      }

      return createNewTab({
        type: UNSAVED_ANALYSIS_STATE,
        pollCountdown: 3,
        paramSpecs: panelState.paramSpecs,
        paramValues: panelState.paramValues,
        formStatus: panelState.formStatus,
        formErrorMessage: panelState.formErrorMessage,
        formValidationErrors: panelState.formValidationErrors,
        analysisType: choices.find(
          ({ name }) => name === panelState.analysisConfig.analysisName
        ) as StepAnalysisType,
        analysisName: panelState.analysisConfig.displayName,
        displayName: panelState.analysisConfig.displayName,
        panelUiState: {
          descriptionExpanded: false,
          formExpanded: true,
        },
      });
    })
  );
};

const isStartLoadingTabListing = (
  action: Action
): action is StartLoadingTabListingAction =>
  action.type === START_LOADING_TAB_LISTING;
const isSelectTab = (action: Action): action is SelectTabAction =>
  action.type === SELECT_TAB;
const isStartLoadingSavedTab = (
  action: Action
): action is StartLoadingSavedTabAction =>
  action.type === START_LOADING_SAVED_TAB;
const isStartLoadingChosenAnalysisTab = (
  action: Action
): action is StartLoadingChosenAnalysisTabAction =>
  action.type === START_LOADING_CHOSEN_ANALYSIS_TAB;
const isDeleteAnalysis = (action: Action): action is DeleteAnalysisAction =>
  action.type === DELETE_ANALYSIS;
const isStartFormSubmission = (
  action: Action
): action is StartFormSubmissionAction => action.type === START_FORM_SUBMISSION;
const isRunAnalysis = (action: Action): action is RunAnalysisAction =>
  action.type === RUN_ANALYSIS;
const isCheckResultStatus = (
  action: Action
): action is CheckResultStatusAction => action.type === CHECK_RESULT_STATUS;
const isCountDown = (action: Action): action is CountDownAction =>
  action.type === COUNT_DOWN;
const isRenameAnalysis = (action: Action): action is RenameAnalysisAction =>
  action.type === RENAME_ANALYSIS;
const isRemoveTab = (action: Action): action is RemoveTabAction =>
  action.type === REMOVE_TAB;
const isDuplicateAnalysis = (
  action: Action
): action is DuplicateAnalysisAction => action.type === DUPLICATE_ANALYSIS;

interface FocusedUninitializedAnalysisPanelState<ActionType> {
  action: ActionType;
  choices: StepAnalysisType[];
  stepId: number;
  strategyId: number;
  panelState: UninitializedAnalysisPanelState;
  panelId: number;
}

interface FocusedAnalysisMenuState<ActionType> {
  action: ActionType;
  choices: StepAnalysisType[];
  stepId: number;
  strategyId: number;
  panelState: AnalysisMenuState;
  panelId: number;
}

interface FocusedUnsavedAnalysisState<ActionType> {
  action: ActionType;
  choices: StepAnalysisType[];
  stepId: number;
  strategyId: number;
  panelState: UnsavedAnalysisState;
  panelId: number;
}

interface FocusedSavedAnalysisState<ActionType> {
  action: ActionType;
  choices: StepAnalysisType[];
  stepId: number;
  strategyId: number;
  panelState: SavedAnalysisState;
  panelId: number;
}

interface FocusedState<ActionType> {
  action: ActionType;
  choices: StepAnalysisType[];
  stepId: number;
  strategyId: number;
  panelState: AnalysisPanelState;
  panelId: number;
}

const focusOnPanelById = <ActionType>(
  action: ActionType & { payload: { panelId: number } },
  state: StepAnalysesState
): FocusedState<ActionType> => ({
  action,
  choices: state.analysisChoices,
  stepId: state.stepId,
  strategyId: state.strategyId,
  panelId: action.payload.panelId,
  panelState: state.analysisPanelStates[action.payload.panelId],
});

const onTabInUnitializedAnalysisPanelState = <ActionType>(
  state: FocusedState<ActionType>
): state is FocusedUninitializedAnalysisPanelState<ActionType> =>
  state.panelState && state.panelState.type === UNINITIALIZED_PANEL_STATE;

const onTabInAnalysisMenuState = <ActionType>(
  state: FocusedState<ActionType>
): state is FocusedAnalysisMenuState<ActionType> =>
  state.panelState && state.panelState.type === ANALYSIS_MENU_STATE;

const onTabInRunnableState = <ActionType>(
  state: FocusedState<ActionType>
): state is
  | FocusedUnsavedAnalysisState<ActionType>
  | FocusedSavedAnalysisState<ActionType> =>
  state.panelState &&
  (state.panelState.type === UNSAVED_ANALYSIS_STATE ||
    state.panelState.type === SAVED_ANALYSIS_STATE);

const onTabInSavedState = <ActionType>(
  state: FocusedState<ActionType>
): state is FocusedSavedAnalysisState<ActionType> =>
  state.panelState && state.panelState.type === SAVED_ANALYSIS_STATE;

function parseAnalysisInitializationError(error: any) {
  const isValidationError =
    'status' in error && 'response' in error && error.status === 422;
  const stepValidation = isValidationError
    ? (JSON.parse(error.response) as InvalidStepValidation)
    : undefined;

  if (stepValidation == null) {
    return {
      isValidationError: false,
      errorMessage: 'response' in error ? error.response : String(error),
    };
  } else {
    return {
      isValidationError: true,
      errorMessage: stepValidation.errors.general[0],
    };
  }
}

function determineIfAutorun(
  analysisTypeName: string,
  choices: StepAnalysisType[]
) {
  const myChoice = choices.find(
    (analysis) => analysis.name === analysisTypeName
  );
  return myChoice?.paramNames.length == 0;
}
