import React, { Fragment } from 'react';

import { createSelector } from 'reselect';
import { RootState } from '../../../State/Types';
import { get } from 'lodash';
import { StepAnalysesState, AnalysisPanelState, AnalysisMenuState, UnsavedAnalysisState, UninitializedAnalysisPanelState, SavedAnalysisState } from './StepAnalysisState';
import { transformPanelState } from './StepAnalysisReducer';
import { StepAnalysisStateProps } from '../../Components/StepAnalysis/StepAnalysisView';
import { TabConfig } from 'wdk-client/Core/MoveAfterRefactor/Components/Shared/ResultTabs';
import { StepAnalysisType } from '../../../../Utils/StepAnalysisUtils';
import { locateFormPlugin, locateResultPlugin } from '../../Components/StepAnalysis/StepAnalysisPluginRegistry';
import { Question, SummaryViewPluginField } from 'wdk-client/Utils/WdkModel';
import { ResultPanelState } from 'wdk-client/StoreModules/ResultPanelStoreModule';

type BaseTabConfig = Pick<TabConfig<string>, 'key' | 'display' | 'removable' | 'tooltip'>;

export const webAppUrl = (state: RootState): string => get(state, 'globalData.siteConfig.webAppUrl', '');
export const wdkModelBuildNumber = (state: RootState): number => get(state, 'globalData.config.buildNumber', 0);
export const recordClassDisplayName = (
  { 
    globalData: { recordClasses = [] }, 
    steps: { steps }, 
    stepAnalysis: { stepId } 
  }: RootState
) => {
  const recordClassName = get(steps[stepId], 'recordClassName', '');
  const recordClass = recordClasses.find(({ name }) => name === recordClassName);
  return get(recordClass, 'displayName', '');
};
export const question = (
  { 
    globalData: { questions = [] }, 
    steps: { steps }, 
    stepAnalysis: { stepId } 
  }: RootState
) => {
  const questionName = get(steps[stepId], 'answerSpec.questionName', '');
  const question = questions.find(({ name }) => name === questionName);
  return question;
};
export const summaryViewPlugins = createSelector<RootState, Question | undefined, SummaryViewPluginField[]>(
  question,
  question => question 
    ? question.summaryViewPlugins
    : []
);
export const defaultSummaryView = createSelector<RootState, Question | undefined, string>(
  question,
  question => question 
    ? question.defaultSummaryView
    : ''
);

export const resultPanel = ({ resultPanel }: RootState) => resultPanel;

export const loadingSummaryViewListing = createSelector<RootState, ResultPanelState, boolean>(
  resultPanel,
  ({ questionsLoaded, stepLoaded }) => !questionsLoaded || !stepLoaded
);

export const stepAnalyses = ({ stepAnalysis }: RootState) => stepAnalysis;

export const loadingAnalysisChoices = createSelector<RootState, StepAnalysesState, boolean>(
  stepAnalyses,
  stepAnalyses => stepAnalyses.loadingAnalysisChoices
);

export const activeTab = createSelector<RootState, StepAnalysesState, ResultPanelState, string, string | number>(
  stepAnalyses,
  resultPanel,
  defaultSummaryView,
  (stepAnalyses, resultPanel, defaultSummaryView) => {
    if (stepAnalyses.activeTab === -1) {
      return resultPanel.activeSummaryView || defaultSummaryView;
    }

    return stepAnalyses.activeTab;
  }
);
export const analysisPanelOrder = createSelector<RootState, StepAnalysesState, number[]>(
  stepAnalyses,
  stepAnalyses => stepAnalyses.analysisPanelOrder
);
export const analysisPanelStates = createSelector<RootState, StepAnalysesState, Record<number, AnalysisPanelState>>(
  stepAnalyses,
  stepAnalyses => stepAnalyses.analysisPanelStates
);
export const analysisChoices = createSelector<RootState, StepAnalysesState, StepAnalysisType[]>(
  stepAnalyses,
  stepAnalyses => stepAnalyses.analysisChoices
);

export const newAnalysisButtonVisible = createSelector<RootState, number[], Record<number, AnalysisPanelState>, boolean>(
  analysisPanelOrder,
  analysisPanelStates,
  (analysisPanelOrder, analysisPanelStates) => analysisPanelOrder.every(panelId => analysisPanelStates[panelId].type !== 'ANALYSIS_MENU_STATE')
);

export const analysisBaseTabConfigs = createSelector<RootState, number[], Record<number, AnalysisPanelState>, StepAnalysisType[], BaseTabConfig[]>(
  analysisPanelOrder,
  analysisPanelStates,
  analysisChoices,
  (analysisPanelOrder, analysisPanelStates, analysisChoices) => {
    if (analysisChoices.length === 0) {
      return [];
    }

    return analysisPanelOrder.map(panelId => transformPanelState(
      analysisPanelStates[panelId],
      {
        UninitializedPanelState: ({ displayName }) => ({
          key: `${panelId}`,
          display: displayName,
          removable: true
        }),
        AnalysisMenuState: ({ displayName }) => ({
          key: `${panelId}`,
          display: displayName,
          removable: true
        }),
        UnsavedAnalysisState: ({ displayName }) => ({
          key: `${panelId}`,
          display: `${displayName}*`,
          removable: true
        }),
        SavedAnalysisState: ({ analysisConfig: { displayName } }) => ({
          key: `${panelId}`,
          display: displayName,
          removable: true
        })
      }
    ));
  }
);

export const mapAnalysisPanelStateToProps = (
  analysisPanelState: AnalysisPanelState,
  choices: StepAnalysisType[],
  webAppUrl: string,
  wdkModelBuildNumber: number, 
  recordClassDisplayName: string
): StepAnalysisStateProps => transformPanelState(
  analysisPanelState,
  {
    UninitializedPanelState: mapUnitializedPanelStateToProps,
    AnalysisMenuState: panelState => mapAnalysisMenuStateToProps(
      panelState,
      choices,
      webAppUrl,
      wdkModelBuildNumber,
      recordClassDisplayName
    ),
    UnsavedAnalysisState: panelState => mapUnsavedAnalysisStateToProps(panelState, choices),
    SavedAnalysisState: panelState => mapSavedAnalysisStateToProps(panelState, choices, webAppUrl)
  }
);

const mapUnitializedPanelStateToProps = (panelState: UninitializedAnalysisPanelState): StepAnalysisStateProps =>
  panelState.status === 'LOADING_SAVED_ANALYSIS'
    ? ({ type: 'loading-menu-pane' })
    : ({ type: 'unopened-pane' });

const mapAnalysisMenuStateToProps = (
  analysisMenuState: AnalysisMenuState,
  choices: StepAnalysisType[],
  webAppUrl: string,
  wdkModelBuildNumber: number, 
  recordClassDisplayName: string
): StepAnalysisStateProps => ({ 
  type: 'analysis-menu',
  recordClassDisplayName,
  wdkModelBuildNumber,
  webAppUrl,
  choices,
  selectedType: analysisMenuState.selectedAnalysis 
    ? analysisMenuState.selectedAnalysis.name
    : undefined
});

const mapUnsavedAnalysisStateToProps = (
  { 
    analysisName, 
    analysisType: { 
      shortDescription,
      description,
      hasParameters
    },
    panelUiState: {
      descriptionExpanded,
      formExpanded
    },
    paramSpecs,
    paramValues,
    formUiState,
    formValidationErrors
  }: UnsavedAnalysisState,
  choices: StepAnalysisType[]
): StepAnalysisStateProps => ({
  type: 'selected-analysis',
  analysisName,
  descriptionState: {
    shortDescription,
    description,
    descriptionExpanded
  },
  formState: { 
    hasParameters,
    formExpanded,
    errors: formValidationErrors,
    paramSpecs,
    paramValues,
    formUiState
  },
  pluginRenderers: {
    formRenderer: locateFormPlugin(displayToType(analysisName, choices)).formRenderer,
    resultRenderer: locateResultPlugin(displayToType(analysisName, choices)).resultRenderer
  }
});

const mapSavedAnalysisStateToProps = (
  { 
    analysisConfig,
    analysisConfigStatus,
    panelUiState: {
      descriptionExpanded,
      formExpanded
    },
    resultContents,
    resultUiState,
    resultErrorMessage,
    paramSpecs,
    paramValues,
    formUiState,
    formValidationErrors,
    pollCountdown
  }: SavedAnalysisState,
  choices: StepAnalysisType[],
  webAppUrl: string
): StepAnalysisStateProps => ({
  type: 'selected-analysis',
  analysisName: typeToDisplay(analysisConfig.analysisName, choices),
  descriptionState: {
    shortDescription: analysisConfig.shortDescription,
    description: analysisConfig.description,
    descriptionExpanded
  },
  formState: { 
    hasParameters: typeHasParameters(analysisConfig.analysisName, choices),
    formExpanded,
    errors: formValidationErrors,
    paramSpecs,
    paramValues,
    formUiState
  },
  resultState: analysisConfigStatus === 'COMPLETE' && analysisConfig.status === 'COMPLETE'
    ? {
      type: 'complete-result',
      analysisConfig,
      analysisResult: resultContents,
      resultUiState,
      webAppUrl
    }
    : analysisConfigStatus !== 'ERROR' && (analysisConfig.status === 'PENDING' || analysisConfig.status === 'RUNNING')
    ? {
      type: 'incomplete-result',
      className: 'analysis-pending-pane',
      header: 'Results Pending...',
      reason: (
        <Fragment>
          The results of this analysis are not yet available.<br/>
          We will check again in {pollCountdown} seconds.
        </Fragment>
      )
    }
    : analysisConfigStatus !== 'ERROR' && (analysisConfig.status === 'CREATED' || analysisConfig.status === 'INVALID' || analysisConfig.status === 'COMPLETE')
    ? {
      type: 'incomplete-result',
      className: 'analysis-pending-pane',
      header: '',
      reason: (
        <Fragment></Fragment>
      )
    }
    : analysisConfigStatus !== 'ERROR'
    ? {
      type: 'incomplete-result',
      className: 'analysis-incomplete-pane',
      header: 'Results Unavailable:',
      reason: <Fragment>{reasonTextMap[analysisConfig.status]} </Fragment>
    }
    : {
      type: 'incomplete-result',
      className: 'analysis-incomplete-pane',
      header: 'Results Unavailable:',
      reason: <Fragment>{resultErrorMessage}</Fragment>
    },
  pluginRenderers: {
    formRenderer: locateFormPlugin(analysisConfig.analysisName).formRenderer,
    resultRenderer: locateResultPlugin(analysisConfig.analysisName).resultRenderer
  }
});

const displayToType = (display: string, choices: StepAnalysisType[]) => get(
  choices.find(({ displayName }) => display === displayName),
  'name',
  ''
);

const typeHasParameters = (display: string, choices: StepAnalysisType[]) => get(
  choices.find(({ name }) => display === name),
  'hasParameters',
  false
);

const typeToDisplay = (type: string, choices: StepAnalysisType[]) => get(
  choices.find(({ name }) => type === name),
  'displayName',
  ''
);

const reasonTextMap = {
  'CREATED': '',
  'INVALID': '',
  'COMPLETE': '',
  'PENDING': '',
  'RUNNING': '',
  'ERROR': 'A run of this analysis encountered an error before it could complete.',
  'INTERRUPTED': 'A run of this analysis was interrupted before it could complete',
  'OUT_OF_DATE': (
    'Your previous run\'s results are unavailable and must be ' +
    'regenerated.  Please confirm your parameters above and re-run.'
  ),
  'EXPIRED': (
    'The last run of this analysis took too long to complete and was ' +
    'cancelled.  If this problem persists, please contact us.'
  ),
  'STEP_REVISED': (
    'Your previous analysis results are not available because the result ' +
    'changed when you used the filter table above or revised a search ' +
    'strategy step. Please confirm your analysis parameters and re-run.'
  ),
  'UNKNOWN': ''
};
