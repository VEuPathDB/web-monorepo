import { toNumber, last } from 'lodash';
import React, {useEffect, useLayoutEffect} from 'react';
import { connect } from 'react-redux';
import {Dispatch} from 'redux';

import {wrappable, useSetDocumentTitle} from 'wdk-client/Utils/ComponentUtils';
import {RootState} from 'wdk-client/Core/State/Types';
import StrategyHeader from 'wdk-client/Views/Strategy/StrategyHeader';
import StrategyNotifications from 'wdk-client/Views/Strategy/StrategyNotifications';
import StrategyViewController from 'wdk-client/Controllers/StrategyViewController';
import AllStrategiesController from 'wdk-client/Controllers/AllStrategiesController';
import { PublicStrategiesController } from 'wdk-client/Controllers/PublicStrategiesController';
import { ImportStrategyController } from 'wdk-client/Controllers/ImportStrategyController';
import {openStrategyView, closeStrategyView, addToOpenedStrategies} from 'wdk-client/Actions/StrategyWorkspaceActions';
import {StrategySummary} from 'wdk-client/Utils/WdkUser';
import { StrategyActionModal } from 'wdk-client/Views/Strategy/StrategyControls';
import {transitionToInternalPage} from 'wdk-client/Actions/RouterActions';

interface OwnProps {
  workspacePath: string;
  subPath: string;
  allowEmptyOpened: boolean;
}

interface DispatchProps {
  dispatch: Dispatch;
}

interface MappedProps {
  activeStrategy?: { strategyId: number, stepId?: number };
  activeModal?: RootState['strategyWorkspace']['activeModal'];
  notifications: Record<string, string | undefined>;
  openedStrategies?: number[];
  strategySummaries?: StrategySummary[];
  publicStrategySummaries?: StrategySummary[];
}

type Props = OwnProps & DispatchProps & MappedProps;

function StrategyWorkspaceController(props: Props) {
  const { dispatch, activeStrategy, notifications, openedStrategies, strategySummaries, publicStrategySummaries } = props;
  const activeStrategyId = activeStrategy && activeStrategy.strategyId;

  useEffect(() => {
    dispatch(openStrategyView());
    return () => {
      dispatch(closeStrategyView());
    }
  }, []);

  useEffect(() => {
    if (activeStrategyId) {
      dispatch(addToOpenedStrategies([activeStrategyId]));
    }
  }, [activeStrategyId]);

  useSetDocumentTitle('My Strategies');

  const openedStrategiesCount = openedStrategies && openedStrategies.length;
  const allStrategiesCount = strategySummaries && strategySummaries.length;
  const publicStrategiesCount = publicStrategySummaries && publicStrategySummaries.length;

  return (
    <div className="StrategyWorkspace">
      <StrategyNotifications notifications={notifications}/>
      <StrategyActionModal activeModal={props.activeModal} strategySummaries={strategySummaries}/>
      <StrategyHeader 
        activeStrategy={activeStrategy} 
        openedStrategiesCount={openedStrategiesCount} 
        allStrategiesCount={allStrategiesCount}
        publicStrategiesCount={publicStrategiesCount}
      />
      <ChildView {...props}/>
    </div>
  )
}

function ChildView({ allowEmptyOpened, dispatch, subPath, openedStrategies, strategySummaries }: Props) {
  const childView = parseSubPath(subPath, allowEmptyOpened);

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

  // Prevent opened tab from being selecting while data needed for redirect above is being loaded
  if (openedStrategies == null || strategySummaries == null) return null;

  switch(childView.type) {
    case 'openedStrategies':
      return <StrategyViewController openedStrategies={openedStrategies} strategyId={childView.strategyId} stepId={childView.stepId}/>
    case 'allStrategies':
      return <AllStrategiesController strategies={strategySummaries}/>
    case 'publicStrategies':
      return <PublicStrategiesController />
    case 'importStrategy':
      return <ImportStrategyController strategySignature={childView.signature} />
    case 'help':
      return <div>TODO</div>
    default:
      return <StrategyViewController openedStrategies={openedStrategies}/>
  }
}

type ChildView =
  | { type: 'openedStrategies', strategyId?: number, stepId?: number }
  | { type: 'allStrategies' }
  | { type: 'publicStrategies' }
  | { type: 'importStrategy', signature: string }
  | { type: 'help' }
  | { type: 'unknown' }

function parseSubPath(subPath: string, allowEmptyOpened: boolean): ChildView {
  if (subPath === 'all') return { type: 'allStrategies' };
  if (subPath === 'public') return { type: 'publicStrategies' };
  if (subPath.startsWith('import/')) return { type: 'importStrategy', signature: subPath.replace('import/', '') };
  if (subPath === 'help') return { type: 'help' };
  if (subPath === '' && !allowEmptyOpened) return { type: 'unknown' };

  const [ strategyId, stepId ] = subPath.split('/');

  return {
    type: 'openedStrategies',
    // if toNumber returns falsey, it is either 0 or NaN, both of which we want to treat as undefined
    strategyId: toNumber(strategyId) || undefined,
    stepId: toNumber(stepId) || undefined
  }
}

function mapState(rootState: RootState): MappedProps {
  const { activeStrategy, notifications, openedStrategies, strategySummaries, publicStrategySummaries, activeModal } = rootState.strategyWorkspace;
  return {
    activeStrategy,
    activeModal,
    notifications,
    openedStrategies,
    strategySummaries,
    publicStrategySummaries
  };
}

export default connect(mapState)(wrappable(StrategyWorkspaceController));
