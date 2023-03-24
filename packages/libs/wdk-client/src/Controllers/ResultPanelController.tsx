import React from 'react';
import ViewController from '../Core/Controllers/ViewController';
import { StepAnalysisEventHandlers } from '../Components/StepAnalysis/StepAnalysisView';
import { StepAnalysisType } from '../Utils/StepAnalysisUtils';
import { memoize, isEqual } from 'lodash/fp';
import ResultTabs, { TabConfig } from '../Components/Shared/ResultTabs';
import { connect } from 'react-redux';
import { transitionToInternalPage } from '../Actions/RouterActions';
import { Loading } from '../Components';
import { RootState } from '../Core/State/Types';
import {
  analysisPanelOrder,
  analysisPanelStates,
  activeTab,
  analysisBaseTabConfigs,
  loadingAnalysisChoices,
  mapAnalysisPanelStateToProps,
  webAppUrl,
  recordClass,
  wdkModelBuildNumber,
  analysisChoices,
  newAnalysisButtonVisible,
  summaryViewPlugins,
  defaultSummaryView,
  loadingSummaryViewListing,
  resultTypeDetails,
  externalToInternalTabIdMaps,
} from '../StoreModules/StepAnalysis/StepAnalysisSelectors';
import { Dispatch } from 'redux';
import {
  startLoadingChosenAnalysisTab,
  startLoadingSavedTab,
  deleteAnalysis,
  selectTab as selectAnalysisTab,
  createNewTab,
  startFormSubmission,
  updateParamValues,
  renameAnalysis,
  duplicateAnalysis,
  toggleDescription,
  toggleParameters,
} from '../Actions/StepAnalysis/StepAnalysisActionCreators';
import { Plugin } from '../Utils/ClientPlugin';
import {
  openTabListing,
  selectSummaryView,
} from '../Actions/ResultPanelActions';
import { SummaryViewPluginField } from '../Utils/WdkModel';
import { wrappable } from '../Utils/ComponentUtils';
import { ResultType, ResultTypeDetails } from '../Utils/WdkResult';

type StateProps = {
  resultTypeDetails?: ResultTypeDetails;
  loadingSummaryViewListing: ReturnType<typeof loadingSummaryViewListing>;
  loadingAnalysisChoices: ReturnType<typeof loadingAnalysisChoices>;
  summaryViewPlugins: ReturnType<typeof summaryViewPlugins>;
  defaultSummaryView: ReturnType<typeof defaultSummaryView>;
  webAppUrl: ReturnType<typeof webAppUrl>;
  wdkModelBuildNumber: ReturnType<typeof wdkModelBuildNumber>;
  recordClass: ReturnType<typeof recordClass>;
  analysisChoices: ReturnType<typeof analysisChoices>;
  analysisBaseTabConfigs: ReturnType<typeof analysisBaseTabConfigs>;
  analysisPanelOrder: ReturnType<typeof analysisPanelOrder>;
  analysisPanelStates: ReturnType<typeof analysisPanelStates>;
  activeTab: ReturnType<typeof activeTab>;
  newAnalysisButtonVisible: ReturnType<typeof newAnalysisButtonVisible>;
  externalToInternalTabId: ReturnType<
    typeof externalToInternalTabIdMaps
  >['externalToInternalTabId'];
  internalToExternalTabId: ReturnType<
    typeof externalToInternalTabIdMaps
  >['internalToExternalTabId'];
};

type OwnProps = {
  resultType: ResultType;
  viewId: string;
  initialTab?: string;
  tabId?: string;
  renderHeader?: () => React.ReactNode;
};

interface TabEventHandlers {
  loadTabs: (resultType: ResultType) => void;
  openAnalysisMenu: () => void;
  onTabSelected: (tabKey: string) => void;
  onTabRemoved: (tabKey: string) => void;
  transitionToTabPage: (
    strategyId: number,
    stepId: number,
    tabId?: string
  ) => void;
}

type PanelEventHandlers = {
  [K in keyof StepAnalysisEventHandlers]: (
    panelId: number
  ) => StepAnalysisEventHandlers[K];
};

interface ResultPanelControllerProps {
  header: React.ReactNode;
  summaryViewPlugins: SummaryViewPluginField[];
  defaultSummaryView: string;
  resultType: ResultType;
  viewId: string;
  loadingTabs: boolean;
  stepErrorMessage?: string;
  isUnauthorized: boolean;
  activeTab: string;
  tabs: TabConfig<string>[];
  onTabSelected: (tabKey: string) => void;
  onTabRemoved: (tabKey: string) => void;
  loadTabs: (resultType: ResultType) => void;
  newAnalysisButton: React.ReactNode;
}

class ResultPanelController extends ViewController<ResultPanelControllerProps> {
  loadData(prevProps?: ResultPanelControllerProps) {
    if (
      prevProps == null ||
      resultTypeHasChanged(prevProps.resultType, this.props.resultType)
    ) {
      this.props.loadTabs(this.props.resultType);
    }
  }

  isRenderDataLoadError() {
    return this.props.stepErrorMessage != null;
  }

  isRenderDataPermissionDenied() {
    return this.props.isUnauthorized;
  }

  renderView() {
    return (
      <React.Fragment>
        {this.props.header}
        <ResultTabs
          loadingTabs={this.props.loadingTabs}
          resultType={this.props.resultType}
          activeTab={`${this.props.activeTab}`}
          onTabSelected={this.props.onTabSelected}
          onTabRemoved={this.props.onTabRemoved}
          tabs={this.props.tabs}
          headerContent={this.props.newAnalysisButton}
          containerClassName={`result-tabs`}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: RootState, props: OwnProps): StateProps => ({
  resultTypeDetails: resultTypeDetails(state, props),
  loadingSummaryViewListing: loadingSummaryViewListing(state, props),
  loadingAnalysisChoices: loadingAnalysisChoices(state),
  summaryViewPlugins: summaryViewPlugins(state, props),
  defaultSummaryView: defaultSummaryView(state, props),
  webAppUrl: webAppUrl(state),
  recordClass: recordClass(state, props),
  wdkModelBuildNumber: wdkModelBuildNumber(state),
  analysisChoices: analysisChoices(state),
  analysisPanelOrder: analysisPanelOrder(state),
  analysisPanelStates: analysisPanelStates(state),
  analysisBaseTabConfigs: analysisBaseTabConfigs(state),
  activeTab: activeTab(state, props),
  newAnalysisButtonVisible: newAnalysisButtonVisible(state),
  ...externalToInternalTabIdMaps(state, props),
});

const mapDispatchToProps = (
  dispatch: Dispatch,
  { resultType, viewId, initialTab }: OwnProps
): TabEventHandlers & PanelEventHandlers => ({
  loadTabs: (resultType: ResultType) =>
    dispatch(openTabListing(viewId, resultType, initialTab)),
  openAnalysisMenu: () => {
    if (resultType.type == 'step') {
      dispatch(
        transitionToInternalPage(
          `/workspace/strategies/${resultType.step.strategyId}/${resultType.step.id}`,
          { replace: true }
        )
      );
    }

    dispatch(
      createNewTab({
        type: 'ANALYSIS_MENU_STATE',
        displayName: 'New Analysis',
        status: 'AWAITING_USER_CHOICE',
        errorMessage: null,
      })
    );
  },
  onTabSelected: (tabKey: string) => {
    if (+tabKey !== +tabKey) {
      dispatch(selectAnalysisTab(-1));
      dispatch(selectSummaryView(viewId, resultType, tabKey));
    } else {
      dispatch(selectSummaryView(viewId, resultType, null));
      dispatch(selectAnalysisTab(+tabKey));
    }
  },
  onTabRemoved: (tabKey: string) => dispatch(deleteAnalysis(+tabKey)),
  transitionToTabPage: (strategyId: number, stepId: number, tabId?: string) => {
    const redirectUrl =
      tabId == null
        ? `/workspace/strategies/${strategyId}/${stepId}`
        : `/workspace/strategies/${strategyId}/${stepId}/${tabId}`;

    dispatch(transitionToInternalPage(redirectUrl, { replace: true }));
  },
  toggleDescription: memoize(
    (panelId: number) => () => dispatch(toggleDescription(panelId))
  ),
  toggleParameters: memoize(
    (panelId: number) => () => dispatch(toggleParameters(panelId))
  ),
  loadChoice: memoize(
    (panelId: number) => (choice: StepAnalysisType) =>
      dispatch(startLoadingChosenAnalysisTab(panelId, choice))
  ),
  loadSavedAnalysis: memoize(
    (panelId: number) => () => dispatch(startLoadingSavedTab(panelId))
  ),
  updateParamValues: memoize(
    (panelId: number) => (newParamValues: Record<string, string>) =>
      dispatch(updateParamValues(panelId, newParamValues))
  ),
  onFormSubmit: memoize(
    (panelId: number) => () => dispatch(startFormSubmission(panelId))
  ),
  renameAnalysis: memoize(
    (panelId: number) => (newDisplayName: string) =>
      dispatch(renameAnalysis(panelId, newDisplayName))
  ),
  duplicateAnalysis: memoize(
    (panelId: number) => () => dispatch(duplicateAnalysis(panelId))
  ),
});

const mergeProps = (
  stateProps: StateProps,
  eventHandlers: TabEventHandlers & PanelEventHandlers,
  ownProps: OwnProps
): ResultPanelControllerProps & OwnProps => ({
  ...ownProps,
  header: ownProps.renderHeader ? ownProps.renderHeader() : null,
  stepErrorMessage: undefined, // TODO: clean up when we have new error handling system
  isUnauthorized: false, // TODO: clean up when we have new error handling system
  summaryViewPlugins: stateProps.summaryViewPlugins,
  defaultSummaryView: stateProps.defaultSummaryView,
  loadingTabs:
    stateProps.loadingSummaryViewListing ||
    (ownProps.resultType.type === 'step' && stateProps.loadingAnalysisChoices),
  activeTab: `${stateProps.activeTab}`,
  newAnalysisButton:
    ownProps.resultType.type === 'step' &&
    stateProps.analysisChoices.length > 0 &&
    stateProps.newAnalysisButtonVisible ? (
      <button
        id="add-analysis"
        title="Choose an analysis tool to apply to the results of your current step."
        onClick={eventHandlers.openAnalysisMenu}
      >
        Analyze Results
      </button>
    ) : null,
  onTabSelected: (tabKey: string) => {
    if (ownProps.resultType.type === 'step') {
      eventHandlers.transitionToTabPage(
        ownProps.resultType.step.strategyId,
        ownProps.resultType.step.id,
        stateProps.internalToExternalTabId[tabKey]
      );
    }

    eventHandlers.onTabSelected(tabKey);
  },
  onTabRemoved: (key: string) => {
    eventHandlers.onTabRemoved(key);
    eventHandlers.onTabSelected(stateProps.defaultSummaryView);
  },
  loadTabs: eventHandlers.loadTabs,
  tabs: [
    ...stateProps.summaryViewPlugins.map((plugin) => ({
      key: plugin.name,
      display: plugin.displayName,
      removable: false,
      tooltip: plugin.description,
      content: stateProps.resultTypeDetails ? (
        <Plugin
          context={{
            type: 'summaryView',
            name: plugin.name,
            ...stateProps.resultTypeDetails,
          }}
          pluginProps={{
            resultType: ownProps.resultType,
            viewId: ownProps.viewId,
          }}
          fallback={<Loading />}
        />
      ) : null,
    })),
    ...(ownProps.resultType.type !== 'step'
      ? []
      : stateProps.analysisBaseTabConfigs.map((baseTabConfig) => ({
          ...baseTabConfig,
          content: (
            <Plugin
              context={{
                type: 'stepAnalysisView',
                name: 'defaultStepAnalysisView',
              }}
              pluginProps={{
                key: baseTabConfig.key,
                ...mapAnalysisPanelStateToProps(
                  +baseTabConfig.key,
                  stateProps.analysisPanelStates[+baseTabConfig.key],
                  stateProps.analysisChoices,
                  stateProps.webAppUrl,
                  stateProps.wdkModelBuildNumber,
                  stateProps.recordClass
                    ? stateProps.recordClass.displayName
                    : ''
                ),
                loadChoice: eventHandlers.loadChoice(+baseTabConfig.key),
                loadSavedAnalysis: eventHandlers.loadSavedAnalysis(
                  +baseTabConfig.key
                ),
                toggleDescription: eventHandlers.toggleDescription(
                  +baseTabConfig.key
                ),
                toggleParameters: eventHandlers.toggleParameters(
                  +baseTabConfig.key
                ),
                updateParamValues: eventHandlers.updateParamValues(
                  +baseTabConfig.key
                ),
                onFormSubmit: eventHandlers.onFormSubmit(+baseTabConfig.key),
                renameAnalysis: eventHandlers.renameAnalysis(
                  +baseTabConfig.key
                ),
                duplicateAnalysis: eventHandlers.duplicateAnalysis(
                  +baseTabConfig.key
                ),
              }}
              fallback={<Loading />}
            />
          ),
        }))),
  ],
});

function resultTypeHasChanged(
  prevResultType: ResultType,
  nextResultType: ResultType
) {
  return prevResultType.type === 'step' && nextResultType.type === 'step'
    ? prevResultType.step.searchName !== nextResultType.step.searchName ||
        !isEqual(
          prevResultType.step.searchConfig,
          nextResultType.step.searchConfig
        )
    : !isEqual(prevResultType, nextResultType);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(wrappable(ResultPanelController));
