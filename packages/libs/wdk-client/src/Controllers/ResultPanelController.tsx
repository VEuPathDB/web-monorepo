import React from 'react';
import ViewController from 'wdk-client/Core/Controllers/ViewController';
import { StepAnalysisEventHandlers } from 'wdk-client/Core/MoveAfterRefactor/Components/StepAnalysis/StepAnalysisView';
import { StepAnalysisType } from 'wdk-client/Utils/StepAnalysisUtils';
import { memoize } from 'lodash/fp';
import ResultTabs, { TabConfig } from 'wdk-client/Core/MoveAfterRefactor/Components/Shared/ResultTabs';
import { connect } from 'react-redux';
import { RootState } from 'wdk-client/Core/State/Types';
import { analysisPanelOrder, analysisPanelStates, activeTab, analysisBaseTabConfigs, loadingAnalysisChoices, mapAnalysisPanelStateToProps, webAppUrl, recordClassDisplayName, wdkModelBuildNumber, analysisChoices, newAnalysisButtonVisible, summaryViewPlugins, defaultSummaryView, loadingSummaryViewListing } from 'wdk-client/Core/MoveAfterRefactor/StoreModules/StepAnalysis/StepAnalysisSelectors';
import { Dispatch } from 'redux';
import { startLoadingChosenAnalysisTab, deleteAnalysis, selectTab, createNewTab, startFormSubmission, updateParamValues, renameAnalysis, duplicateAnalysis, toggleDescription, updateFormUiState, updateResultUiState, toggleParameters } from 'wdk-client/Core/MoveAfterRefactor/Actions/StepAnalysis/StepAnalysisActionCreators';
import { Plugin } from 'wdk-client/Utils/ClientPlugin';
import { openTabListing, selectSummaryView } from 'wdk-client/Actions/ResultPanelActions';
import { SummaryViewPluginField } from 'wdk-client/Utils/WdkModel';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import { Step } from 'wdk-client/Utils/WdkUser';

type StateProps = {
  step: Step;
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
  loadingTabs: boolean;
  activeTab: string;
  tabs: TabConfig<string>[];
  onTabSelected: (tabKey: string) => void;
  onTabRemoved: (tabKey: string) => void;
  loadTabs: (stepId: number) => void;
  newAnalysisButton: React.ReactNode;
}

class ResultPanelController extends ViewController< ResultPanelControllerProps > {
  componentDidMount() {
    super.componentDidMount();
    this.props.loadTabs(
      this.props.stepId
    );
  }

  isRenderDataLoaded() {
    return !this.props.loadingTabs;
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
  step: state.steps.steps[props.stepId],
  loadingSummaryViewListing: loadingSummaryViewListing(state),
  loadingAnalysisChoices: loadingAnalysisChoices(state),
  summaryViewPlugins: summaryViewPlugins(state),
  defaultSummaryView: defaultSummaryView(state),
  webAppUrl: webAppUrl(state),
  recordClassDisplayName: recordClassDisplayName(state),
  wdkModelBuildNumber: wdkModelBuildNumber(state),
  analysisChoices: analysisChoices(state),
  analysisPanelOrder: analysisPanelOrder(state), 
  analysisPanelStates: analysisPanelStates(state),
  analysisBaseTabConfigs: analysisBaseTabConfigs(state),
  activeTab: activeTab(state),
  newAnalysisButtonVisible: newAnalysisButtonVisible(state)
});

const mapDispatchToProps = (dispatch: Dispatch): TabEventHandlers & PanelEventHandlers => ({
  loadTabs: (stepId: number) => dispatch(openTabListing(stepId)),
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
      dispatch(selectSummaryView(tabKey));
    } else {
      dispatch(selectSummaryView(null));
      dispatch(selectTab(+tabKey));
    }
  },
  onTabRemoved: (tabKey: string) => dispatch(deleteAnalysis(+tabKey)),
  toggleDescription: memoize((panelId: number) => () => dispatch(toggleDescription(panelId))),
  toggleParameters: memoize((panelId: number) => () => dispatch(toggleParameters(panelId))),
  loadChoice: memoize((panelId: number) => (choice: StepAnalysisType) => dispatch(startLoadingChosenAnalysisTab(panelId, choice))),
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
  summaryViewPlugins: stateProps.summaryViewPlugins,
  defaultSummaryView: stateProps.defaultSummaryView,
  loadingTabs: stateProps.loadingSummaryViewListing || stateProps.loadingAnalysisChoices,
  activeTab: `${stateProps.activeTab}`,
  newAnalysisButton: stateProps.analysisChoices.length > 0 && stateProps.newAnalysisButtonVisible
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
  onTabRemoved: eventHandlers.onTabRemoved,
  loadTabs: eventHandlers.loadTabs,
  tabs: [
    ...stateProps.summaryViewPlugins.map(
      plugin => ({
        key: plugin.name,
        display: plugin.displayName,
        removable: false,
        tooltip: plugin.description,
        content: stateProps.step ? (
          <Plugin 
            context={{
              type: 'summaryView',
              name: plugin.name,
              recordClassName: stateProps.step.recordClassName,
              questionName: stateProps.step.answerSpec.questionName
            }}
            pluginProps={{
              stepId: ownProps.stepId
            }}
          />
        ) : null
      })
    ),
    ...stateProps.analysisBaseTabConfigs.map(
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
    )
  ]
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(wrappable(ResultPanelController));
