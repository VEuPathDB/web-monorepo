import React from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';
import { RootState } from 'wdk-client/Core/State/Types';

import './StrategyHeading.css';
import { connect } from 'react-redux';

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

interface Props {
  activeStrategy?: { strategyId: number, stepId?: number };
}

function StrategyHeader(props: Props) {
  const rootRoute = `/workspace/strategies`;
  const activeStratPath = props.activeStrategy ? `/${props.activeStrategy.strategyId}` : '';
  const activeStepPath = props.activeStrategy && props.activeStrategy.stepId ? `/${props.activeStrategy.stepId}` : '';
  const openedStrategiesRoute = rootRoute + activeStratPath + activeStepPath;
  return (
    <div className="StrategyHeading">
      <NavLink className="StrategyHeading--Item" activeClassName="StrategyHeading--Item__active" to={openedStrategiesRoute} isActive={isOpenedLinkActive}>Opened Strategies</NavLink>
      <span className="StrategyHeading--Separator"> | </span>
      <NavLink className="StrategyHeading--Item" activeClassName="StrategyHeading--Item__active" to={`${rootRoute}/all`}>All Strategies</NavLink>
      <span className="StrategyHeading--Separator"> | </span>
      <NavLink className="StrategyHeading--Item" activeClassName="StrategyHeading--Item__active" to={`${rootRoute}/help`}>Help</NavLink>
    </div>
  )
}

function mapState(rootState: RootState) {
  const { activeStrategy } = rootState.strategyView;
  return { activeStrategy };
}

export default connect(mapState, null)(StrategyHeader);
