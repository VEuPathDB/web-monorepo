import React, { Fragment } from 'react';

import { createSelector } from 'reselect';
import { RootState } from '../../../State/Types';
import { get } from 'lodash';
import { StepAnalysesState, AnalysisPanelState, AnalysisMenuState, UnsavedAnalysisState, UninitializedAnalysisPanelState, SavedAnalysisState } from './StepAnalysisState';
import { transformPanelState } from './StepAnalysisReducer';
import { StepAnalysisStateProps } from '../../Components/StepAnalysis/StepAnalysisView';
import { TabConfig } from '../../../../Components/Tabs/Tabs';
import { StepAnalysisType } from '../../../../Utils/StepAnalysisUtils';
import { locateFormPlugin, locateResultPlugin } from '../../Components/StepAnalysis/StepAnalysisPluginRegistry';

type BaseTabConfig = Pick<TabConfig<string>, 'key' | 'display' | 'removable' | 'tooltip'>;

export const webAppUrl = (state: RootState): string => get(state, 'globalData.siteConfig.webAppUrl', '');
export const wdkModelBuildNumber = (state: RootState): number => get(state, 'globalData.config.buildNumber', 0);
export const recordClassDisplayName = (state: RootState) => 'Gene';

export const stepAnalyses = ({ stepAnalysis }: RootState) => stepAnalysis;

export const activeTab = createSelector<RootState, StepAnalysesState, number>(
  stepAnalyses,
  stepAnalyses => stepAnalyses.activeTab
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

export const analysisBaseTabConfigs = createSelector<RootState, number[], Record<number, AnalysisPanelState>, StepAnalysisType[], BaseTabConfig[]>(
  analysisPanelOrder,
  analysisPanelStates,
  analysisChoices,
  (analysisPanelOrder, analysisPanelStates, analysisChoices) => {
    if (analysisChoices.length === 0) {
      return [];
    }

    const analysisPanelTabs = analysisPanelOrder.map(panelId => transformPanelState(
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
          display: displayName,
          removable: true
        }),
        SavedAnalysisState: ({ analysisConfig: { displayName } }) => ({
          key: `${panelId}`,
          display: displayName,
          removable: true
        })
      }
    ));
    
    return analysisPanelOrder.some(panelId => analysisPanelStates[panelId].type === 'ANALYSIS_MENU_STATE')
      ? analysisPanelTabs
      : [
          ...analysisPanelTabs,
          {
            key: 'new-analysis',
            display: (
              <Fragment>
                Create New Analysis <i className="fa fa-plus"></i>
              </Fragment>
            ),
            removable: false,
            tooltip: 'Choose an analysis tool to apply to the results of your current step'
          }
      ];
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
    descriptionUiState: {
      descriptionExpanded
    },
    paramSpecs,
    paramValues,
    formUiState
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
    errors: [],
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
    descriptionUiState: {
      descriptionExpanded
    },
    resultContents,
    resultUiState,
    paramSpecs,
    paramValues,
    formUiState,
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
    hasParameters: analysisConfig.hasParams,
    errors: [],
    paramSpecs,
    paramValues,
    formUiState
  },
  resultState: analysisConfigStatus === 'COMPLETE'
    ? {
      type: 'complete-result',
      analysisConfig,
      analysisResult: resultContents,
      resultUiState,
      webAppUrl
    }
    : {
      type: 'incomplete-result',
      className: 'analysis-pending-pane',
      header: 'Results Pending...',
      reason: (
        <Fragment>
          The results of this analysis are not yet available.<br/>
          We will check again in {pollCountdown} seconds.
        </Fragment>
      )
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

const typeToDisplay = (type: string, choices: StepAnalysisType[]) => get(
  choices.find(({ name }) => type === name),
  'displayName',
  ''
);
