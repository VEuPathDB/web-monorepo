import React from 'react';
import { NavLinkProps } from 'react-router-dom';

import './StrategyHeading.css';
import WorkspaceNavigation from 'wdk-client/Components/Workspace/WorkspaceNavigation';

// The link for Opened strategies is active if the url matches one of:
// - /workspace/strategies
// - /workspace/strategies/:strategyId
// - /workspace/strategies/:strategyId/:stepId
// - /workspace/strategies/:strategyId/:stepId/:tabId
const isOpenedLinkActive: NavLinkProps['isActive'] = (match , location) => {
  if (match == null) return false;
  if (!location.pathname.startsWith(match.url)) return false;
  const subPath = location.pathname.replace(match.url, '');
  return /^(\/\d+){0,3}$/.test(subPath);
}

const toCountString = (count?: number, isError?: boolean) => (
  isError ? <div className="Count-Error">!</div>
  : count != null ? count.toLocaleString()
  : <div className="Count-Loading" title="Loading...">...</div>
)

interface Props {
  activeStrategy?: { strategyId: number, stepId?: number };
  openedStrategiesCount?: number;
  allStrategiesCount?: number;
  publicStrategiesCount?: number;
  publicStrategiesError?: boolean;
}

function StrategyHeader(props: Props) {
  const activeStratPath = props.activeStrategy ? `${props.activeStrategy.strategyId}` : '';
  const activeStepPath = props.activeStrategy && props.activeStrategy.stepId ? `/${props.activeStrategy.stepId}` : '';
  const { openedStrategiesCount, allStrategiesCount, publicStrategiesCount, publicStrategiesError } = props
  return (
    <WorkspaceNavigation
      routeBase="/workspace/strategies/"
      heading="My Search Strategies"
      items={[
        {
          display: <>Opened ({toCountString(openedStrategiesCount)})</>,
          route: activeStratPath + activeStepPath,
          state: { allowEmptyOpened: true },
          isActive: isOpenedLinkActive
        },
        {
          display: <>All ({toCountString(allStrategiesCount)})</>,
          route: 'all'
        },
        {
          display: <>Public ({toCountString(publicStrategiesCount, publicStrategiesError)})</>,
          route: 'public'
        },
        {
          display: 'Help',
          route: 'help'
        }
      ]}
    />
  )
}

export default StrategyHeader;
