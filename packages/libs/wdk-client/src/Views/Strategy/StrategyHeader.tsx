import React from 'react';
import { NavLink } from 'react-router-dom';

import './StrategyHeading.css';

export default function StrategyHeader() {
  return (
    <div className="StrategyHeading">
      <NavLink className="StrategyHeading--Item" activeClassName="StrategyHeading--Item__active" to="/workspace/strategies/all">All Strategies</NavLink>
      <span className="StrategyHeading--Separator"> | </span>
      <NavLink className="StrategyHeading--Item" activeClassName="StrategyHeading--Item__active" to="/workspace/strategies/active">Active Strategies</NavLink>
      <span className="StrategyHeading--Separator"> | </span>
      <NavLink className="StrategyHeading--Item" activeClassName="StrategyHeading--Item__active" to="/workspace/strategies/help">Help</NavLink>
    </div>
  )
}