import React from 'react';
import { NavLink } from 'react-router-dom';

// TODO Add classes and styles
export default function StrategyHeader() {
  return (
    <div>
      <NavLink to="/workspace/strategies/all">All Strategies</NavLink>
      <span> | </span>
      <NavLink to="/workspace/strategies/active">Active Strategies</NavLink>
      <span> | </span>
      <NavLink to="/workspace/strategies/help">Help</NavLink>
    </div>
  )
}