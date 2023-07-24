import {
  StepAnalysisConfig,
  StepAnalysisType,
} from '../../Utils/StepAnalysisUtils';
import { Parameter } from '../../Utils/WdkModel';

export const UNINITIALIZED_PANEL_STATE = 'UNINITIALIZED_PANEL_STATE';
export const ANALYSIS_MENU_STATE = 'ANALYSIS_MENU_STATE';
export const UNSAVED_ANALYSIS_STATE = 'UNSAVED_ANALYSIS_STATE';
export const SAVED_ANALYSIS_STATE = 'SAVED_ANALYSIS_STATE';

export interface StepAnalysesState {
  loadingAnalysisChoices: boolean;
  activeTab: number;
  analysisChoices: StepAnalysisType[];
  stepId: number;
  strategyId: number;
  nextPanelId: number;
  analysisPanelStates: Record<number, AnalysisPanelState>;
  analysisPanelOrder: number[];
}

export type AnalysisPanelState =
  | UninitializedAnalysisPanelState
  | AnalysisMenuState
  | UnsavedAnalysisState
  | SavedAnalysisState;

// This state is for analyses that have been saved during previous visits to Step Analysis
export interface UninitializedAnalysisPanelState {
  type: typeof UNINITIALIZED_PANEL_STATE;
  analysisId: number;
  displayName: string;
  status: 'UNOPENED' | 'LOADING_SAVED_ANALYSIS' | 'ERROR';
  errorMessage: string | null;
}

export interface AnalysisMenuState {
  type: typeof ANALYSIS_MENU_STATE;
  displayName: string;
  selectedAnalysis?: StepAnalysisType;
  status: 'AWAITING_USER_CHOICE' | 'CREATING_UNSAVED_ANALYSIS' | 'ERROR';
  errorMessage: string | null;
}

export interface UnsavedAnalysisState extends AnalysisFormState {
  type: typeof UNSAVED_ANALYSIS_STATE;
  displayName: string;
  analysisName: string;
  analysisType: StepAnalysisType;
  pollCountdown: number;
  panelUiState: { descriptionExpanded: boolean; formExpanded: boolean };
}

export interface SavedAnalysisState
  extends AnalysisFormState,
    AnalysisResultState {
  type: typeof SAVED_ANALYSIS_STATE;
  analysisConfig: StepAnalysisConfig;
  analysisConfigStatus: 'LOADING' | 'COMPLETE' | 'ERROR';
  pollCountdown: number;
  panelUiState: { descriptionExpanded: boolean; formExpanded: boolean };
}

interface AnalysisFormState {
  paramSpecs: Parameter[];
  paramValues: Record<string, string>;
  formStatus: 'AWAITING_USER_SUBMISSION' | 'SAVING_ANALYSIS' | 'ERROR';
  formErrorMessage: string | null;
  formValidationErrors: string[];
}

interface AnalysisResultState {
  resultContents: Record<string, any>;
  resultErrorMessage: string | null;
}
