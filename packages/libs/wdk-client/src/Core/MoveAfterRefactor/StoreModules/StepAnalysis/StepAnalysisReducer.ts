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
  SavedAnalysisState
} from './StepAnalysisState';
import { 
  START_LOADING_TAB_LISTING, 
  FINISH_LOADING_TAB_LISTING, 
  SELECT_TAB, 
  START_LOADING_SAVED_TAB, 
  FINISH_LOADING_SAVED_TAB,
  START_LOADING_CHOSEN_ANALYSIS_TAB, 
  FINISH_LOADING_CHOSEN_ANALYSIS_TAB, 
  CREATE_NEW_TAB, 
  DELETE_ANALYSIS,
  REMOVE_TAB,
  START_FORM_SUBMISSION, 
  CHECK_RESULT_STATUS, 
  COUNT_DOWN, 
  FINISH_FORM_SUBMISSION, 
  RENAME_ANALYSIS, 
  RENAME_TAB, 
  DUPLICATE_ANALYSIS,
  UPDATE_PARAM_VALUES,
  TOGGLE_DESCRIPTION,
  TOGGLE_PARAMETERS
} from '../../Actions/StepAnalysis/StepAnalysisActionConstants';
import { StepAnalysisAction } from '../../Actions/StepAnalysis/StepAnalysisActions';
import { equals } from 'lodash/fp';

const initialState: StepAnalysesState = {
  loadingAnalysisChoices: false,
  activeTab: -1,
  analysisChoices: [],
  stepId: -1,
  strategyId: -1,
  nextPanelId: 0,
  analysisPanelStates: {},
  analysisPanelOrder: []
};

export function reduce(state: StepAnalysesState = initialState, action: StepAnalysisAction): StepAnalysesState {
  switch (action.type) {
    case START_LOADING_TAB_LISTING: {
      return {
        // reset state since we are creating a new set of tabs
        ...initialState,
        stepId: action.payload.stepId,
        strategyId: action.payload.strategyId,
        loadingAnalysisChoices: true,
      };
    }

    case FINISH_LOADING_TAB_LISTING: {
      return action.payload.tabListing.reduce(
        insertPanelState,
        {
          ...state,
          analysisChoices: action.payload.analysisChoices,
          loadingAnalysisChoices: false
        }
      );
    }

    case SELECT_TAB: {
      return {
        ...state,
        activeTab: action.payload.panelId
      };
    }

    case START_LOADING_SAVED_TAB: {
      return updatePanelState(
        state,
        action.payload.panelId,
        {
          UninitializedPanelState: panelState => ({
            ...panelState,
            status: 'LOADING_SAVED_ANALYSIS'
          }),
          AnalysisMenuState: identity,
          UnsavedAnalysisState: identity,
          SavedAnalysisState: identity
        }
      );
    }

    case FINISH_LOADING_SAVED_TAB: {
      return updatePanelState(
        state,
        action.payload.panelId,
        {
          UninitializedPanelState: _ => action.payload.loadedState,
          AnalysisMenuState: identity,
          UnsavedAnalysisState: _ => action.payload.loadedState,
          SavedAnalysisState: identity
        }
      )
    }

    case START_LOADING_CHOSEN_ANALYSIS_TAB: {
      return updatePanelState(
        state,
        action.payload.panelId,
        {
          UninitializedPanelState: identity,
          AnalysisMenuState: panelState => ({
            ...panelState,
            selectedAnalysis: action.payload.choice,
            status: 'CREATING_UNSAVED_ANALYSIS'
          }),
          UnsavedAnalysisState: identity,
          SavedAnalysisState: identity
        }
      )
    }

    case FINISH_LOADING_CHOSEN_ANALYSIS_TAB: {
      return updatePanelState(
        state,
        action.payload.panelId,
        {
          UninitializedPanelState: identity,
          AnalysisMenuState: _ => action.payload.loadedState,
          UnsavedAnalysisState: identity,
          SavedAnalysisState: identity
        }
      );
    }

    case CREATE_NEW_TAB: {
      const insertedTabState = insertPanelState(state, action.payload.initialState);
      
      return {
        ...insertedTabState,
        activeTab: insertedTabState.analysisPanelOrder[
          insertedTabState.analysisPanelOrder.length - 1
        ]
      };
    }

    case DELETE_ANALYSIS: {
      return state;
    }

    case REMOVE_TAB: {
      const tabIndex = state.analysisPanelOrder.find(equals(action.payload.panelId));
      
      if (tabIndex === undefined) {
        return state;
      }
      
      const removedPanelState = state.analysisPanelStates[action.payload.panelId];
      const removedTabState = removePanelState(state, action.payload.panelId);
      const newActiveTab = removedPanelState.type === ANALYSIS_MENU_STATE ? -1
        : removedTabState.activeTab === action.payload.panelId ?
          (removedTabState.analysisPanelOrder[tabIndex] || removedTabState.analysisPanelOrder[tabIndex - 1] || -1)
        : removedTabState.activeTab;

      return {
        ...removedTabState,
        activeTab: newActiveTab
      };
    }

    case START_FORM_SUBMISSION: {
      return updatePanelState(
        state,
        action.payload.panelId,
        {
          UninitializedPanelState: identity,
          AnalysisMenuState: identity,
          UnsavedAnalysisState: panelState => ({
            ...panelState,
            pollCountdown: 3,
            formStatus: 'SAVING_ANALYSIS'
          }),
          SavedAnalysisState: panelState => ({
            ...panelState,
            pollCountdown: 3,
            formStatus: 'SAVING_ANALYSIS'
          })
        }
      );
    }

    case CHECK_RESULT_STATUS: {
      return state;
    }

    case COUNT_DOWN: {
      return updatePanelState(
        state,
        action.payload.panelId,
        {
          UninitializedPanelState: identity,
          AnalysisMenuState: identity,
          UnsavedAnalysisState: panelState => ({
            ...panelState,
            pollCountdown: panelState.pollCountdown > 0
              ? panelState.pollCountdown - 1
              : 3
          }),
          SavedAnalysisState: panelState => ({
            ...panelState,
            pollCountdown: panelState.pollCountdown > 0
              ? panelState.pollCountdown - 1
              : 3
          })
        }
      )
    }

    case FINISH_FORM_SUBMISSION: {
      return updatePanelState(
        state,
        action.payload.panelId,
        {
          UninitializedPanelState: identity,
          AnalysisMenuState: identity,
          UnsavedAnalysisState: identity,
          SavedAnalysisState: _ => action.payload.loadedState
        }
      )
    }

    case RENAME_ANALYSIS: {
      return state;
    }

    case RENAME_TAB: {
      return updatePanelState(
        state,
        action.payload.panelId,
        {
          UninitializedPanelState: identity,
          AnalysisMenuState: identity,
          UnsavedAnalysisState: panelState => ({
            ...panelState,
            displayName: action.payload.newDisplayName
          }),
          SavedAnalysisState: panelState => ({
            ...panelState,
            analysisConfig: {
              ...panelState.analysisConfig,
              displayName: action.payload.newDisplayName
            }
          })
        }
      )
    }

    case DUPLICATE_ANALYSIS: {
      return state;
    }

    case UPDATE_PARAM_VALUES: {
      return updatePanelState(
        state,
        action.payload.panelId,
        {
          UninitializedPanelState: identity,
          AnalysisMenuState: identity,
          UnsavedAnalysisState: panelState => ({
            ...panelState,
            paramValues: action.payload.newParamValues
          }),
          SavedAnalysisState: panelState => ({
            ...panelState,
            paramValues: action.payload.newParamValues
          })
        }
      );
    }

    case TOGGLE_DESCRIPTION: {
      return updatePanelState(
        state,
        action.payload.panelId,
        {
          UninitializedPanelState: identity,
          AnalysisMenuState: identity,
          UnsavedAnalysisState: panelState => ({
            ...panelState,
            panelUiState: {
              ...panelState.panelUiState,
              descriptionExpanded: !panelState.panelUiState.descriptionExpanded
            }
          }),
          SavedAnalysisState: panelState => ({
            ...panelState,
            panelUiState: {
              ...panelState.panelUiState,
              descriptionExpanded: !panelState.panelUiState.descriptionExpanded
            }
          })
        }
      );
    }

    case TOGGLE_PARAMETERS: {
      return updatePanelState(
        state,
        action.payload.panelId,
        {
          UninitializedPanelState: identity,
          AnalysisMenuState: identity,
          UnsavedAnalysisState: panelState => ({
            ...panelState,
            panelUiState: {
              ...panelState.panelUiState,
              formExpanded: !panelState.panelUiState.formExpanded
            }
          }),
          SavedAnalysisState: panelState => ({
            ...panelState,
            panelUiState: {
              ...panelState.panelUiState,
              formExpanded: !panelState.panelUiState.formExpanded
            }
          })
        }
      );
    }

    default: {
      return state;
    }
  }
}

export type AnalysisPanelStatePattern<R = AnalysisPanelState, S = AnalysisPanelState, T = AnalysisPanelState, U = AnalysisPanelState> = {
  UninitializedPanelState: (_: UninitializedAnalysisPanelState) => R;
  AnalysisMenuState: (_: AnalysisMenuState) => S;
  UnsavedAnalysisState: (_: UnsavedAnalysisState) => T;
  SavedAnalysisState: (_: SavedAnalysisState) => U;
};

export const transformPanelState = <R, S, T, U>(panelState: AnalysisPanelState, matcher: AnalysisPanelStatePattern<R, S, T, U>): R | S | T | U => {
  switch(panelState.type) {
    case UNINITIALIZED_PANEL_STATE:
      return matcher.UninitializedPanelState(panelState);
    case ANALYSIS_MENU_STATE:
      return matcher.AnalysisMenuState(panelState);
    case UNSAVED_ANALYSIS_STATE:
      return matcher.UnsavedAnalysisState(panelState);
    case SAVED_ANALYSIS_STATE:
      return matcher.SavedAnalysisState(panelState);
  }
};

const insertPanelState = (state: StepAnalysesState, newPanelState: AnalysisPanelState): StepAnalysesState => {
  // make sure that menu is always last
  const menuPanelId = Object.keys(state.analysisPanelStates).find(id =>
    state.analysisPanelStates[+id].type === ANALYSIS_MENU_STATE);

  // only one menu tab is allowed
  if (menuPanelId != null && newPanelState.type === ANALYSIS_MENU_STATE) {
    return state;
  }

  const nextOrder = menuPanelId == null
    ? [ ...state.analysisPanelOrder, state.nextPanelId ]
    : [ ...state.analysisPanelOrder.filter(id => id !== +menuPanelId), state.nextPanelId, +menuPanelId ]

  return ({
    ...state,
    nextPanelId: state.nextPanelId + 1,
    analysisPanelStates: {
      ...state.analysisPanelStates,
      [state.nextPanelId]: newPanelState
    },
    analysisPanelOrder: nextOrder
  })
}

const updatePanelState = (state: StepAnalysesState, panelId: number, pattern: AnalysisPanelStatePattern): StepAnalysesState => {
  const oldPanelState = state.analysisPanelStates[panelId];

  return !oldPanelState
    ? state
    : {
      ...state,
      analysisPanelStates: {
        ...state.analysisPanelStates,
        [panelId]: transformPanelState(
          oldPanelState,
          pattern
        )
      }
    };
};

const removePanelState = (state: StepAnalysesState, panelId: number): StepAnalysesState => {
  const { [panelId]: _, ...newAnalysisPanelStates } = state.analysisPanelStates;
  const newAnalysisPanelOrder = state.analysisPanelOrder.filter(id => id !== panelId);

  return {
    ...state,
    analysisPanelStates: newAnalysisPanelStates,
    analysisPanelOrder: newAnalysisPanelOrder
  };
};

const identity = <T>(t: T) => t;
