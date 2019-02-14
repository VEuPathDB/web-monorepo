import React from 'react';
import ViewController from 'wdk-client/Core/Controllers/ViewController';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import { StepAnalysisView, StepAnalysisEventHandlers } from '../../Components/StepAnalysis/StepAnalysisView';
import { StepAnalysisType } from '../../../../Utils/StepAnalysisUtils';
import { memoize } from 'lodash/fp';
import ResultTabs, { TabConfig } from 'wdk-client/Core/MoveAfterRefactor/Components/Shared/ResultTabs';
import { connect } from 'react-redux';
import { RootState } from '../../../State/Types';
import { analysisPanelOrder, analysisPanelStates, activeTab, analysisBaseTabConfigs, mapAnalysisPanelStateToProps, webAppUrl, recordClassDisplayName, wdkModelBuildNumber, analysisChoices, newAnalysisButtonVisible } from '../../StoreModules/StepAnalysis/StepAnalysisSelectors';
import { Dispatch } from 'redux';
import { startLoadingChosenAnalysisTab, startLoadingTabListing, deleteAnalysis, selectTab, createNewTab, startFormSubmission, updateParamValues, renameAnalysis, duplicateAnalysis, toggleDescription, updateFormUiState, updateResultUiState, toggleParameters } from '../../Actions/StepAnalysis/StepAnalysisActionCreators';

type StateProps = {
  webAppUrl: ReturnType<typeof webAppUrl>;
  wdkModelBuildNumber: ReturnType<typeof wdkModelBuildNumber>;
  recordClassDisplayName: ReturnType<typeof recordClassDisplayName>;
  analysisChoices: ReturnType<typeof analysisChoices>;
  analysisBaseTabConfigs: ReturnType<typeof analysisBaseTabConfigs>;
  analysisPanelOrder: ReturnType<typeof analysisPanelOrder>, 
  analysisPanelStates: ReturnType<typeof analysisPanelStates>, 
  activeTab: ReturnType<typeof activeTab>;
  newAnalysisButtonVisible: boolean;
};

type OwnProps = {
  stepId: number;
}

interface TabEventHandlers {
  loadTabs: (stepId: number) => void;
  openAnalysisMenu: () => void;
  onTabSelected: (tabKey: string) => void;
  onTabRemoved: (tabKey: string) => void;
}

type PanelEventHandlers = {
  [K in keyof StepAnalysisEventHandlers]: (panelId: number) => StepAnalysisEventHandlers[K];
};

interface StepAnalysisContainerProps {
  stepId: number;
  loadingTabs: boolean;
  activeTab: string;
  tabs: TabConfig<string>[];
  onTabSelected: (tabKey: string) => void;
  onTabRemoved: (tabKey: string) => void;
  loadTabs: (stepId: number) => void;
  newAnalysisButton: React.ReactNode;
}

class StepAnalysisController extends ViewController< StepAnalysisContainerProps > {
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
      />
    );
  }
}

const mapStateToProps = (state: RootState): StateProps => ({ 
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
  loadTabs: (stepId: number) => dispatch(startLoadingTabListing(stepId)),
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
  onTabSelected: (tabKey: string) => dispatch(selectTab(+tabKey)),
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
): StepAnalysisContainerProps & OwnProps => ({
  ...ownProps,
  loadingTabs: stateProps.analysisChoices.length === 0,
  activeTab: `${stateProps.activeTab}`,
  newAnalysisButton: (
    <button 
      id="add-analysis" 
      title="Choose an analysis tool to apply to the results of your current step." 
      onClick={eventHandlers.openAnalysisMenu}
    >
      Analyze Results
    </button>
  ),
  onTabSelected: eventHandlers.onTabSelected,
  onTabRemoved: eventHandlers.onTabRemoved,
  loadTabs: eventHandlers.loadTabs,
  tabs: stateProps.analysisBaseTabConfigs.map(
    baseTabConfig => ({ 
      ...baseTabConfig, 
      content: (
        <StepAnalysisView
          key={baseTabConfig.key}
          {
            ...mapAnalysisPanelStateToProps(
              stateProps.analysisPanelStates[+baseTabConfig.key],
              stateProps.analysisChoices,
              stateProps.webAppUrl,
              stateProps.wdkModelBuildNumber,
              stateProps.recordClassDisplayName
            )
          } 
          loadChoice={eventHandlers.loadChoice(+baseTabConfig.key)}
          toggleDescription={eventHandlers.toggleDescription(+baseTabConfig.key)}
          toggleParameters={eventHandlers.toggleParameters(+baseTabConfig.key)}
          updateParamValues={eventHandlers.updateParamValues(+baseTabConfig.key)}
          updateFormUiState={eventHandlers.updateFormUiState(+baseTabConfig.key)}
          onFormSubmit={eventHandlers.onFormSubmit(+baseTabConfig.key)}
          updateResultsUiState={eventHandlers.updateResultsUiState(+baseTabConfig.key)}
          renameAnalysis={eventHandlers.renameAnalysis(+baseTabConfig.key)}
          duplicateAnalysis={eventHandlers.duplicateAnalysis(+baseTabConfig.key)}
        />
      )
    })
  )
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
) (wrappable(StepAnalysisController));
