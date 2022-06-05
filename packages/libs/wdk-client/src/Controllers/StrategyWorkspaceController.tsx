import { toNumber, last } from 'lodash';
import React, { useEffect, useLayoutEffect } from 'react';
import { connect } from 'react-redux';
import {Dispatch} from 'redux';

import {wrappable, useSetDocumentTitle} from 'wdk-client/Utils/ComponentUtils';
import {RootState} from 'wdk-client/Core/State/Types';
import StrategyHeader from 'wdk-client/Views/Strategy/StrategyHeader';
import StrategyViewController from 'wdk-client/Controllers/StrategyViewController';
import AllStrategiesController from 'wdk-client/Controllers/AllStrategiesController';
import { PublicStrategiesController } from 'wdk-client/Controllers/PublicStrategiesController';
import { ImportStrategyController } from 'wdk-client/Controllers/ImportStrategyController';
import {openStrategyView, closeStrategyView, addToOpenedStrategies, setActiveStrategy} from 'wdk-client/Actions/StrategyWorkspaceActions';
import {StrategySummary} from 'wdk-client/Utils/WdkUser';
import { StrategyActionModal } from 'wdk-client/Views/Strategy/StrategyControls';
import {transitionToInternalPage} from 'wdk-client/Actions/RouterActions';
import StrategyHelpPage from 'wdk-client/Views/Strategy/StrategyHelpPage';
import Loading from 'wdk-client/Components/Loading';
import UnownedStrategy from 'wdk-client/Views/Strategy/UnownedStrategy';

interface OwnProps {
  workspacePath: string;
  subPath: string;
  allowEmptyOpened: boolean;
  queryParams: Record<string, string>;
}

interface DispatchProps {
  dispatch: Dispatch;
}

interface MappedProps {
  activeStrategy?: { strategyId: number, stepId?: number };
  activeModal?: RootState['strategyWorkspace']['activeModal'];
  openedStrategies?: number[];
  strategySummaries?: StrategySummary[];
  strategySummariesLoading?: boolean;
  publicStrategySummaries?: StrategySummary[];
  publicStrategySummariesError?: boolean;
  strategies: RootState['strategies']['strategies'];
}

type Props = OwnProps & DispatchProps & MappedProps;

function StrategyWorkspaceController(props: Props) {
  const { dispatch, activeStrategy, openedStrategies, strategySummaries, publicStrategySummaries, publicStrategySummariesError } = props;

  useEffect(() => {
    dispatch(openStrategyView());
    return () => {
      dispatch(closeStrategyView());
    }
  }, []);

  useSetDocumentTitle('My Strategies');

  const openedStrategiesCount = openedStrategies && openedStrategies.length;
  const allStrategiesCount = strategySummaries && strategySummaries.length;
  const publicStrategiesCount = publicStrategySummaries && publicStrategySummaries.length;

  return (
    <div className="StrategyWorkspace">
      <StrategyActionModal activeModal={props.activeModal} strategySummaries={strategySummaries}/>
      <StrategyHeader
        activeStrategy={activeStrategy} 
        openedStrategiesCount={openedStrategiesCount} 
        allStrategiesCount={allStrategiesCount}
        publicStrategiesCount={publicStrategiesCount}
        publicStrategiesError={publicStrategySummariesError}
      />
      {/* Only load ChildView when openedStrategies and strategySummaries are loaded, to prevent clobbering store values. Not ideal, but it works. */}
        {openedStrategies && strategySummaries ? <ChildView {...props} /> : <Loading/>}
    </div>
  )
}

function ChildView({ allowEmptyOpened, queryParams, dispatch, subPath, openedStrategies = [], strategySummaries = [], strategySummariesLoading, strategies }: Props) {
  const childView = parseSubPath(subPath, allowEmptyOpened, queryParams);
  const activeStrategyId = childView.type === 'openedStrategies' ? childView.strategyId : undefined;
  const activeStepId = childView.type === 'openedStrategies' ? childView.stepId : undefined;
  const ownsActiveStrategy = activeStrategyId == null
    ? false
    : activeStrategyId in strategies || strategySummaries.some(({ strategyId }) => strategyId === activeStrategyId)

  // Select last opened strategy, if no strategy is specified in url
  // Note, using `useLayoutEffect` to prevent glitches when transistion between routes
  useLayoutEffect(() => {
    if (childView.type === 'unknown' && openedStrategies != null) {
      const lastOpened = last(openedStrategies);
      if (lastOpened) {
        dispatch(transitionToInternalPage(`/workspace/strategies/${lastOpened}`));
      }
      else if (strategySummaries && strategySummaries.length > 0) {
        dispatch(transitionToInternalPage(`/workspace/strategies/all`));
      }
    }
  }, [childView, openedStrategies, strategySummaries, dispatch]);

  // If the user is navigatating to a strategy they own,
  // update openedStrategies if necessary
  useEffect(() => {
    if (activeStrategyId && ownsActiveStrategy) {
      dispatch(addToOpenedStrategies([activeStrategyId]));
    }
  }, [activeStrategyId, ownsActiveStrategy]);

  // If the user is navigating to a strategy they own,
  // update the activeStrategy approriately
  useEffect(() => {
    if (activeStrategyId && ownsActiveStrategy) {
      dispatch(setActiveStrategy(activeStrategyId == null ? undefined : {
        strategyId: activeStrategyId,
        stepId: activeStepId
      }));
    }
  }, [activeStrategyId, activeStepId, ownsActiveStrategy]);

  // Prevent opened tab from being selecting while data needed for redirect above is being loaded
  if (openedStrategies == null || strategySummaries == null) return <Loading/>;

  if (activeStrategyId != null && !ownsActiveStrategy) return <UnownedStrategy/>;

  switch(childView.type) {
    case 'openedStrategies':
      return <StrategyViewController
        openedStrategies={openedStrategies}
        strategyId={childView.strategyId}
        stepId={childView.stepId}
        selectedTab={childView.selectedTab}
        tabId={childView.tabId}
      />
    case 'allStrategies':
      return <AllStrategiesController strategies={strategySummaries} strategiesLoading={strategySummariesLoading}/>
    case 'publicStrategies':
      return <PublicStrategiesController />
    case 'importStrategy':
      return <ImportStrategyController strategySignature={childView.signature} selectedTab={childView.selectedTab} />
    case 'help':
      return <StrategyHelpPage/>
    default:
      return <StrategyViewController openedStrategies={openedStrategies}/>
  }
}

type ChildView =
  | { type: 'openedStrategies', strategyId?: number, stepId?: number, selectedTab?: string, tabId?: string }
  | { type: 'allStrategies' }
  | { type: 'publicStrategies' }
  | { type: 'importStrategy', signature: string, selectedTab?: string }
  | { type: 'help' }
  | { type: 'unknown' }

function parseSubPath(subPath: string, allowEmptyOpened: boolean, queryParams: Record<string, string>): ChildView {
  if (subPath === 'all') return { type: 'allStrategies' };
  if (subPath === 'public') return { type: 'publicStrategies' };
  if (subPath.startsWith('import/')) return { type: 'importStrategy', signature: subPath.replace('import/', ''), selectedTab: queryParams.selectedTab };
  if (subPath === 'help') return { type: 'help' };
  if (subPath === '' && !allowEmptyOpened) return { type: 'unknown' };

  const [ strategyId, stepId, tabId ] = subPath.split('/');
  const { selectedTab } = queryParams;

  return {
    type: 'openedStrategies',
    // if toNumber returns falsey, it is either 0 or NaN, both of which we want to treat as undefined
    strategyId: toNumber(strategyId) || undefined,
    stepId: toNumber(stepId) || undefined,
    tabId: tabId || undefined,
    selectedTab
  };
}

function mapState(rootState: RootState): MappedProps {
  const { strategies: { strategies } } = rootState;
  const { activeStrategy, openedStrategies, strategySummaries, publicStrategySummaries, publicStrategySummariesError, activeModal, strategySummariesLoading } = rootState.strategyWorkspace;
  return {
    activeStrategy,
    activeModal,
    openedStrategies,
    strategySummaries,
    strategySummariesLoading,
    publicStrategySummaries,
    publicStrategySummariesError,
    strategies
  };
}

export default connect(mapState)(wrappable(StrategyWorkspaceController));
