import React from 'react';
import { ComputationConfigProps, ComputationPlugin } from '../Types';

export const plugin: ComputationPlugin = {
  configurationComponent: AlphaDivConfiguration,
  visualizationTypes: {},
};

export function AlphaDivConfiguration(props: ComputationConfigProps) {
  const { computationAppOverview } = props;

  return (
    <div style={{ padding: '1em 0' }}>
      <h1>{computationAppOverview.displayName}</h1>
      <pre>{computationAppOverview.description}</pre>
      <ul>
        {computationAppOverview.visualizations?.map((viz) => (
          <li>{viz.displayName}</li>
        ))}
      </ul>
    </div>
  );
}
