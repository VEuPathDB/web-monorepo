import React from 'react';

import { ComputationProps } from './Types';

export function ComputationOverview(props: ComputationProps) {
  const { computationAppOverview } = props;
  return (
    <div
      style={{
        padding: '1em 0',
      }}
    >
      <h1>{computationAppOverview.displayName}</h1>
      <p>{computationAppOverview.description}</p>
      <h2>Available visualizations</h2>
      <ul>
        {computationAppOverview.visualizations.map((viz) => (
          <li>
            {viz.displayName} &mdash; {viz.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
