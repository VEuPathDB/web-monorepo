import React from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';

import './StrategyHeading.css';

// The link for Opened strategies is active if the url matches one of:
// - /workspace/strategies
// - /workspace/strategies/:strategyId
// - /workspace/strategies/:strategyId/:stepId
const isOpenedLinkActive: NavLinkProps['isActive'] = (match , location) => {
  if (match == null) return false;
  if (!location.pathname.startsWith(match.url)) return false;
  const subPath = location.pathname.replace(match.url, '');
  return /^(\/\d+){0,2}$/.test(subPath);
}

const toCountString = (count?: number) => count != null ? count.toLocaleString() : '...';

interface Props {
  activeStrategy?: { strategyId: number, stepId?: number };
  openedStrategiesCount?: number;
  allStrategiesCount?: number;
  publicStrategiesCount?: number;
}

function StrategyHeader(props: Props) {
  const rootRoute = `/workspace/strategies`;
  const activeStratPath = props.activeStrategy ? `/${props.activeStrategy.strategyId}` : '';
  const activeStepPath = props.activeStrategy && props.activeStrategy.stepId ? `/${props.activeStrategy.stepId}` : '';
  const openedStrategiesRoute = rootRoute + activeStratPath + activeStepPath;
  const { openedStrategiesCount, allStrategiesCount, publicStrategiesCount } = props
  return (
    <div className="StrategyHeading">
      <h1>My Strategies</h1>
      <NavLink className="StrategyHeading--Item" activeClassName="StrategyHeading--Item__active" to={openedStrategiesRoute} isActive={isOpenedLinkActive}>
        Opened ({toCountString(openedStrategiesCount)})
      </NavLink>
      <span className="StrategyHeading--Separator"></span>
      <NavLink className="StrategyHeading--Item" activeClassName="StrategyHeading--Item__active" to={`${rootRoute}/all`}>
        All ({toCountString(allStrategiesCount)})
      </NavLink>
      <span className="StrategyHeading--Separator"></span>
      <NavLink className="StrategyHeading--Item" activeClassName="StrategyHeading--Item__active" to={`${rootRoute}/public`}>
        Public ({toCountString(publicStrategiesCount)})
      </NavLink>
      <span className="StrategyHeading--Separator"></span>
      <NavLink className="StrategyHeading--Item" activeClassName="StrategyHeading--Item__active" to={`${rootRoute}/help`}>
        Help
      </NavLink>
    </div>
  )
}

export default StrategyHeader;
