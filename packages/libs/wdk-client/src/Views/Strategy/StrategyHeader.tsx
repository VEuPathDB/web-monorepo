import React from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';

import './StrategyHeading.css';

// The link for Opened strategies is active if the url matches one of:
// - /workspace/strategies
// - /workspace/strategies/:strategyId
// - /workspace/strategies/:strategyId/:stepId
const isOpenedLinkActive: NavLinkProps['isActive'] = (match , location) => {
  if (!location.pathname.startsWith(match.url)) return false;
  const subPath = location.pathname.replace(match.url, '');
  return /^(\/\d+){0,2}$/.test(subPath);
}

export default function StrategyHeader() {
  return (
    <div className="StrategyHeading">
      <NavLink className="StrategyHeading--Item" activeClassName="StrategyHeading--Item__active" to="/workspace/strategies" isActive={isOpenedLinkActive}>Opened Strategies</NavLink>
      <span className="StrategyHeading--Separator"> | </span>
      <NavLink className="StrategyHeading--Item" activeClassName="StrategyHeading--Item__active" to="/workspace/strategies/all">All Strategies</NavLink>
      <span className="StrategyHeading--Separator"> | </span>
      <NavLink className="StrategyHeading--Item" activeClassName="StrategyHeading--Item__active" to="/workspace/strategies/help">Help</NavLink>
    </div>
  )
}