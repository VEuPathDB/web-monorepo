import React from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';

import './StrategyHeading.css';

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
  const rootRoute = `/workspace/strategies`;
  const activeStratPath = props.activeStrategy ? `/${props.activeStrategy.strategyId}` : '';
  const activeStepPath = props.activeStrategy && props.activeStrategy.stepId ? `/${props.activeStrategy.stepId}` : '';
  const openedStrategiesRoute = {
    pathname: rootRoute + activeStratPath + activeStepPath,
    state: { allowEmptyOpened: true }
  };
  const { openedStrategiesCount, allStrategiesCount, publicStrategiesCount, publicStrategiesError } = props
  return (
    <div className="StrategyHeading">
      <h1>My Search Strategies</h1>
      <NavLink className="StrategyHeading--Item" activeClassName="StrategyHeading--Item__active" to={openedStrategiesRoute} isActive={isOpenedLinkActive}>
        Opened ({toCountString(openedStrategiesCount)})
      </NavLink>
      <span className="StrategyHeading--Separator"></span>
      <NavLink className="StrategyHeading--Item" activeClassName="StrategyHeading--Item__active" to={`${rootRoute}/all`}>
        All ({toCountString(allStrategiesCount)})
      </NavLink>
      <span className="StrategyHeading--Separator"></span>
      <NavLink className="StrategyHeading--Item" activeClassName="StrategyHeading--Item__active" to={`${rootRoute}/public`}>
        Public ({toCountString(publicStrategiesCount, publicStrategiesError)})
      </NavLink>
      <span className="StrategyHeading--Separator"></span>
      <NavLink className="StrategyHeading--Item" activeClassName="StrategyHeading--Item__active" to={`${rootRoute}/help`}>
        Help
      </NavLink>
    </div>
  )
}

export default StrategyHeader;
