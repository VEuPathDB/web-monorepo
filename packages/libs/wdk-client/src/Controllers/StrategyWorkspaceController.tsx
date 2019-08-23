import { toNumber } from 'lodash';
import React, {useEffect} from 'react';
import { connect } from 'react-redux';
import {Dispatch} from 'redux';

import {wrappable, useSetDocumentTitle} from 'wdk-client/Utils/ComponentUtils';
import {RootState} from 'wdk-client/Core/State/Types';
import StrategyHeader from 'wdk-client/Views/Strategy/StrategyHeader';
import StrategyNotifications from 'wdk-client/Views/Strategy/StrategyNotifications';
import StrategyViewController from 'wdk-client/Controllers/StrategyViewController';
import AllStrategiesController from 'wdk-client/Controllers/AllStrategiesController';
import { PublicStrategiesController } from 'wdk-client/Controllers/PublicStrategiesController';
import {openStrategyView, closeStrategyView} from 'wdk-client/Actions/StrategyWorkspaceActions';
import {StrategyDetails, StrategySummary} from 'wdk-client/Utils/WdkUser';
import { StrategyActionModal } from 'wdk-client/Views/Strategy/StrategyControls';

interface OwnProps {
  workspacePath: string;
  subPath: string;
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

function ChildView({ subPath, openedStrategies, strategySummaries }: Props) {
  const childView = parseSubPath(subPath);
  switch(childView.type) {
    case 'openedStrategies':
      return <StrategyViewController openedStrategies={openedStrategies} strategyId={childView.strategyId} stepId={childView.stepId}/>
    case 'allStrategies':
      return <AllStrategiesController strategies={strategySummaries}/>
    case 'publicStrategies':
      return <PublicStrategiesController />
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
  | { type: 'help' };

function parseSubPath(subPath: string): ChildView {
  if (subPath === 'all') return { type: 'allStrategies' };
  if (subPath === 'public') return { type: 'publicStrategies' };
  if (subPath === 'help') return { type: 'help' };

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
