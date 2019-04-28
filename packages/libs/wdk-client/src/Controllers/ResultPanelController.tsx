import React from 'react';
import ViewController from 'wdk-client/Core/Controllers/ViewController';
import { StepAnalysisEventHandlers } from 'wdk-client/Core/MoveAfterRefactor/Components/StepAnalysis/StepAnalysisView';
import { StepAnalysisType } from 'wdk-client/Utils/StepAnalysisUtils';
import { memoize } from 'lodash/fp';
import ResultTabs, { TabConfig } from 'wdk-client/Core/MoveAfterRefactor/Components/Shared/ResultTabs';
import { connect } from 'react-redux';
import { RootState } from 'wdk-client/Core/State/Types';
import {
  analysisPanelOrder,
  analysisPanelStates,
  activeTab,
  analysisBaseTabConfigs,
  loadingAnalysisChoices,
  mapAnalysisPanelStateToProps,
  webAppUrl,
  recordClassDisplayName,
  wdkModelBuildNumber,
  analysisChoices,
  newAnalysisButtonVisible,
  summaryViewPlugins,
  defaultSummaryView,
  loadingSummaryViewListing
} from 'wdk-client/Core/MoveAfterRefactor/StoreModules/StepAnalysis/StepAnalysisSelectors';
import { Dispatch } from 'redux';
import {
  startLoadingChosenAnalysisTab,
  startLoadingSavedTab,
  deleteAnalysis,
  selectTab,
  createNewTab,
  startFormSubmission,
  updateParamValues,
  renameAnalysis,
  duplicateAnalysis,
  toggleDescription,
  updateFormUiState,
  updateResultUiState,
  toggleParameters
} from 'wdk-client/Core/MoveAfterRefactor/Actions/StepAnalysis/StepAnalysisActionCreators';
import { Plugin } from 'wdk-client/Utils/ClientPlugin';
import { openTabListing, selectSummaryView } from 'wdk-client/Actions/ResultPanelActions';
import { SummaryViewPluginField } from 'wdk-client/Utils/WdkModel';
import { LoadingOverlay } from 'wdk-client/Components';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import { StepEntry } from 'wdk-client/StoreModules/StepsStoreModule';

type StateProps = {
  stepEntry?: StepEntry;
  loadingSummaryViewListing: ReturnType<typeof loadingSummaryViewListing>;
  loadingAnalysisChoices: ReturnType<typeof loadingAnalysisChoices>,
  summaryViewPlugins: ReturnType<typeof summaryViewPlugins>;
  defaultSummaryView: ReturnType<typeof defaultSummaryView>;
  webAppUrl: ReturnType<typeof webAppUrl>;
  wdkModelBuildNumber: ReturnType<typeof wdkModelBuildNumber>;
  recordClassDisplayName: ReturnType<typeof recordClassDisplayName>;
  analysisChoices: ReturnType<typeof analysisChoices>;
  analysisBaseTabConfigs: ReturnType<typeof analysisBaseTabConfigs>;
  analysisPanelOrder: ReturnType<typeof analysisPanelOrder>, 
  analysisPanelStates: ReturnType<typeof analysisPanelStates>, 
  activeTab: ReturnType<typeof activeTab>;
  newAnalysisButtonVisible: ReturnType<typeof newAnalysisButtonVisible>;
};

type OwnProps = {
  stepId: number;
  viewId: string;
  initialTab?: string;
};

interface TabEventHandlers {
  loadTabs: (stepId: number) => void;
  openAnalysisMenu: () => void;
  onTabSelected: (tabKey: string) => void;
  onTabRemoved: (tabKey: string) => void;
}

type PanelEventHandlers = {
  [K in keyof StepAnalysisEventHandlers]: (panelId: number) => StepAnalysisEventHandlers[K];
};

interface ResultPanelControllerProps {
  summaryViewPlugins: SummaryViewPluginField[];
  defaultSummaryView: string;
  stepId: number;
  viewId: string;
  loadingTabs: boolean;
  stepErrorMessage?: string;
  isUnauthorized: boolean;
  activeTab: string;
  tabs: TabConfig<string>[];
  onTabSelected: (tabKey: string) => void;
  onTabRemoved: (tabKey: string) => void;
  loadTabs: (stepId: number) => void;
  newAnalysisButton: React.ReactNode;
}

class ResultPanelController extends ViewController< ResultPanelControllerProps > {

  loadData(prevProps?: ResultPanelControllerProps) {
    if (prevProps == null || prevProps.stepId !== this.props.stepId) {
      this.props.loadTabs(this.props.stepId);
    }
  }

  isRenderDataLoadError() {
    return this.props.stepErrorMessage != null;
  }

  isRenderDataPermissionDenied() {
    return this.props.isUnauthorized;
  }

  isRenderDataLoaded() {
    return !this.props.loadingTabs || this.props.stepErrorMessage != null;
  }

  renderDataLoading() {
    return (
      <LoadingOverlay>
        Loading data...
      </LoadingOverlay>
    );
  }

  renderView() {
    return (
      <ResultTabs
        activeTab={`${this.props.activeTab}`}
        onTabSelected={this.props.onTabSelected}
        onTabRemoved={this.props.onTabRemoved}
        tabs={this.props.tabs}
        headerContent={this.props.newAnalysisButton}
        containerClassName={`result-tabs`}
      />
    );
  }
}

const mapStateToProps = (state: RootState, props: OwnProps): StateProps => ({
  stepEntry: state.steps.steps[props.stepId],
  loadingSummaryViewListing: loadingSummaryViewListing(state, props),
  loadingAnalysisChoices: loadingAnalysisChoices(state),
  summaryViewPlugins: summaryViewPlugins(state, props),
  defaultSummaryView: defaultSummaryView(state, props),
  webAppUrl: webAppUrl(state),
  recordClassDisplayName: recordClassDisplayName(state, props),
  wdkModelBuildNumber: wdkModelBuildNumber(state),
  analysisChoices: analysisChoices(state),
  analysisPanelOrder: analysisPanelOrder(state), 
  analysisPanelStates: analysisPanelStates(state),
  analysisBaseTabConfigs: analysisBaseTabConfigs(state),
  activeTab: activeTab(state, props),
  newAnalysisButtonVisible: newAnalysisButtonVisible(state)
});

const mapDispatchToProps = (dispatch: Dispatch, { stepId, viewId, initialTab }: OwnProps): TabEventHandlers & PanelEventHandlers => ({
  loadTabs: (stepId: number) => dispatch(openTabListing(viewId, stepId, initialTab)),
  openAnalysisMenu: () => dispatch(
    createNewTab(
      {
        type: 'ANALYSIS_MENU_STATE',
        displayName: 'New Analysis',
        status: 'AWAITING_USER_CHOICE',
        errorMessage: null 
      }
    )
  ),
  onTabSelected: (tabKey: string) => { 
    if (+tabKey !== +tabKey) {
      dispatch(selectTab(-1));
      dispatch(selectSummaryView(viewId, stepId, tabKey));
    } else {
      dispatch(selectSummaryView(viewId, stepId, null));
      dispatch(selectTab(+tabKey));
    }
  },
  onTabRemoved: (tabKey: string) => dispatch(deleteAnalysis(+tabKey)),
  toggleDescription: memoize((panelId: number) => () => dispatch(toggleDescription(panelId))),
  toggleParameters: memoize((panelId: number) => () => dispatch(toggleParameters(panelId))),
  loadChoice: memoize((panelId: number) => (choice: StepAnalysisType) => dispatch(startLoadingChosenAnalysisTab(panelId, choice))),
  loadSavedAnalysis: memoize((panelId: number) => () => dispatch(startLoadingSavedTab(panelId))),
  updateParamValues: memoize((panelId: number) => (newParamValues: Record<string, string[]>) => dispatch(updateParamValues(panelId, newParamValues))),
  updateFormUiState: memoize((panelId: number) => (newUiState: Record<string, any>) => dispatch(updateFormUiState(panelId, newUiState))),
  onFormSubmit: memoize((panelId: number) => () => dispatch(startFormSubmission(panelId))),
  updateResultsUiState: memoize((panelId: number) => (newUiState: Record<string, any>) => dispatch(updateResultUiState(panelId, newUiState))),
  renameAnalysis: memoize((panelId: number) => (newDisplayName: string) => dispatch(renameAnalysis(panelId, newDisplayName))),
  duplicateAnalysis: memoize((panelId: number) => () => dispatch(duplicateAnalysis(panelId)))
});

const mergeProps = (
  stateProps: StateProps, eventHandlers: TabEventHandlers & PanelEventHandlers, ownProps: OwnProps 
): ResultPanelControllerProps & OwnProps => ({
  ...ownProps,
  stepErrorMessage: stateProps.stepEntry && stateProps.stepEntry.status === 'error'
    ? stateProps.stepEntry.message
    : undefined,
  isUnauthorized: !!stateProps.stepEntry && stateProps.stepEntry.status === 'unauthorized',
  summaryViewPlugins: stateProps.summaryViewPlugins,
  defaultSummaryView: stateProps.defaultSummaryView,
  loadingTabs: (
    (stateProps.stepEntry == null || stateProps.stepEntry.status === 'pending') ||
    stateProps.loadingSummaryViewListing ||
    (ownProps.viewId === 'strategy' && stateProps.loadingAnalysisChoices)
  ),
  activeTab: `${stateProps.activeTab}`,
  newAnalysisButton: ownProps.viewId === 'strategy' && stateProps.analysisChoices.length > 0 && stateProps.newAnalysisButtonVisible
    ? (
      <button 
        id="add-analysis" 
        title="Choose an analysis tool to apply to the results of your current step." 
        onClick={eventHandlers.openAnalysisMenu}
      >
        Analyze Results
      </button>
    )
    : null,
  onTabSelected: eventHandlers.onTabSelected,
  onTabRemoved: (key: string) => {
    eventHandlers.onTabRemoved(key);
    eventHandlers.onTabSelected(stateProps.defaultSummaryView);
  },
  loadTabs: eventHandlers.loadTabs,
  tabs: [
    ...stateProps.summaryViewPlugins.map(
      plugin => ({
        key: plugin.name,
        display: plugin.displayName,
        removable: false,
        tooltip: plugin.description,
        content: stateProps.stepEntry && stateProps.stepEntry.status === 'success' ? (
          <Plugin 
            context={{
              type: 'summaryView',
              name: plugin.name,
              recordClassName: stateProps.stepEntry.step.recordClassName,
              searchName: stateProps.stepEntry.step.searchName
            }}
            pluginProps={{
              stepId: ownProps.stepId,
              viewId: ownProps.viewId
            }}
          />
        ) : null
      })
    ),
    ...(ownProps.viewId !== 'strategy' ? [] : stateProps.analysisBaseTabConfigs.map(
      baseTabConfig => ({ 
        ...baseTabConfig, 
        content: (
          <Plugin
            context={{
              type: 'stepAnalysis',
              name: 'stepAnalysis'
            }}
            pluginProps={{
              key: baseTabConfig.key,
              ...mapAnalysisPanelStateToProps(
                stateProps.analysisPanelStates[+baseTabConfig.key],
                stateProps.analysisChoices,
                stateProps.webAppUrl,
                stateProps.wdkModelBuildNumber,
                stateProps.recordClassDisplayName
              ),
              loadChoice: eventHandlers.loadChoice(+baseTabConfig.key),
              loadSavedAnalysis: eventHandlers.loadSavedAnalysis(+baseTabConfig.key),
              toggleDescription: eventHandlers.toggleDescription(+baseTabConfig.key),
              toggleParameters: eventHandlers.toggleParameters(+baseTabConfig.key),
              updateParamValues: eventHandlers.updateParamValues(+baseTabConfig.key),
              updateFormUiState: eventHandlers.updateFormUiState(+baseTabConfig.key),
              onFormSubmit: eventHandlers.onFormSubmit(+baseTabConfig.key),
              updateResultsUiState: eventHandlers.updateResultsUiState(+baseTabConfig.key),
              renameAnalysis: eventHandlers.renameAnalysis(+baseTabConfig.key),
              duplicateAnalysis: eventHandlers.duplicateAnalysis(+baseTabConfig.key)
            }}
          />
        )
      })
    ))
  ]
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(wrappable(ResultPanelController));
