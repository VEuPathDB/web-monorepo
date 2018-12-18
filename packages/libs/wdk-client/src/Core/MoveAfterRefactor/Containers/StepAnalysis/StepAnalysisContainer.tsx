import React from 'react';
import { PageController } from 'wdk-client/Controllers';
import { StepAnalysisView, StepAnalysisEventHandlers } from '../../Components/StepAnalysis/StepAnalysisView';
import { StepAnalysisType } from '../../../../Utils/StepAnalysisUtils';
import { memoize } from 'lodash/fp';
import Tabs, { TabConfig } from 'wdk-client/Components/Tabs/Tabs';
import { connect } from 'react-redux';
import { RootState } from '../../../State/Types';
import { analysisPanelOrder, analysisPanelStates, activeTab, analysisBaseTabConfigs, mapAnalysisPanelStateToProps, webAppUrl, recordClassDisplayName, wdkModelBuildNumber, analysisChoices } from '../../StoreModules/StepAnalysis/StepAnalysisSelectors';
import { Dispatch } from 'redux';
import { startLoadingChosenAnalysisTab, startLoadingTabListing, deleteAnalysis, selectTab, createNewTab, startFormSubmission, updateParamValues, renameAnalysis, duplicateAnalysis, toggleDescription, updateFormUiState, updateResultUiState } from '../../Actions/StepAnalysis/StepAnalysisActionCreators';
import { PageControllerProps } from '../../../CommonTypes';

type StateProps = {
  webAppUrl: ReturnType<typeof webAppUrl>;
  wdkModelBuildNumber: ReturnType<typeof wdkModelBuildNumber>;
  recordClassDisplayName: ReturnType<typeof recordClassDisplayName>;
  analysisChoices: ReturnType<typeof analysisChoices>;
  analysisBaseTabConfigs: ReturnType<typeof analysisBaseTabConfigs>;
  analysisPanelOrder: ReturnType<typeof analysisPanelOrder>, 
  analysisPanelStates: ReturnType<typeof analysisPanelStates>, 
  activeTab: ReturnType<typeof activeTab>;
};

interface TabEventHandlers {
  loadTabs: (stepId: number) => void;
  onTabSelected: (tabKey: string) => void;
  onTabRemoved: (tabKey: string) => void;
}

type PanelEventHandlers = {
  [K in keyof StepAnalysisEventHandlers]: (panelId: number) => StepAnalysisEventHandlers[K];
};

interface StepAnalysisContainerProps {
  loadingTabs: boolean;
  activeTab: string;
  tabs: TabConfig<string>[];
  onTabSelected: (tabKey: string) => void;
  onTabRemoved: (tabKey: string) => void;
  loadTabs: (stepId: number) => void;
}

class StepAnalysisController extends PageController<StepAnalysisContainerProps> {
  loadData() {
    this.props.loadTabs(
      this.props.match.params.stepId
    );
  }

  isRenderDataLoaded() {
    return !this.props.loadingTabs;
  }

  renderView() {
    return (
      <Tabs
        activeTab={`${this.props.activeTab}`}
        onTabSelected={this.props.onTabSelected}
        onTabRemoved={this.props.onTabRemoved}
        tabs={this.props.tabs}
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
  activeTab: activeTab(state)
});

const mapDispatchToProps = (dispatch: Dispatch): TabEventHandlers & PanelEventHandlers => ({
  loadTabs: (stepId: number) => dispatch(startLoadingTabListing(stepId)),
  onTabSelected: (tabKey: string) => tabKey !== 'new-analysis'
    ? dispatch(selectTab(+tabKey))
    : dispatch(
        createNewTab(
          {
            type: 'ANALYSIS_MENU_STATE',
            displayName: 'New Analysis',
            status: 'AWAITING_USER_CHOICE',
            errorMessage: null
          }
        )
      ),
  onTabRemoved: (tabKey: string) => dispatch(deleteAnalysis(+tabKey)),
  toggleDescription: memoize((panelId: number) => () => dispatch(toggleDescription(panelId))),
  loadChoice: memoize((panelId: number) => (choice: StepAnalysisType) => dispatch(startLoadingChosenAnalysisTab(panelId, choice))),
  updateParamValues: memoize((panelId: number) => (newParamValues: Record<string, string[]>) => dispatch(updateParamValues(panelId, newParamValues))),
  updateFormUiState: memoize((panelId: number) => (newUiState: Record<string, any>) => dispatch(updateFormUiState(panelId, newUiState))),
  onFormSubmit: memoize((panelId: number) => () => dispatch(startFormSubmission(panelId))),
  updateResultsUiState: memoize((panelId: number) => (newUiState: Record<string, any>) => dispatch(updateResultUiState(panelId, newUiState))),
  renameAnalysis: memoize((panelId: number) => (newDisplayName: string) => dispatch(renameAnalysis(panelId, newDisplayName))),
  duplicateAnalysis: memoize((panelId: number) => () => dispatch(duplicateAnalysis(panelId)))
});

const mergeProps = (
  stateProps: StateProps, eventHandlers: TabEventHandlers & PanelEventHandlers, ownProps: PageControllerProps 
): StepAnalysisContainerProps & PageControllerProps => ({
  ...ownProps,
  loadingTabs: stateProps.analysisPanelOrder.length === 0,
  activeTab: `${stateProps.activeTab}`,
  onTabSelected: eventHandlers.onTabSelected,
  onTabRemoved: eventHandlers.onTabRemoved,
  loadTabs: eventHandlers.loadTabs,
  tabs: stateProps.analysisBaseTabConfigs.map(
    baseTabConfig => ({ 
      ...baseTabConfig, 
      content: stateProps.activeTab === +baseTabConfig.key
        ? <StepAnalysisView 
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
            updateParamValues={eventHandlers.updateParamValues(+baseTabConfig.key)}
            updateFormUiState={eventHandlers.updateFormUiState(+baseTabConfig.key)}
            onFormSubmit={eventHandlers.onFormSubmit(+baseTabConfig.key)}
            updateResultsUiState={eventHandlers.updateResultsUiState(+baseTabConfig.key)}
            renameAnalysis={eventHandlers.renameAnalysis(+baseTabConfig.key)}
            duplicateAnalysis={eventHandlers.duplicateAnalysis(+baseTabConfig.key)}
          />
        : <div></div>
     })
  )
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(StepAnalysisController);
