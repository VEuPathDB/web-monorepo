import React from 'react';
import { useMemo } from 'react-redux/node_modules/@types/react';
import { ComputationProps } from './Types';

export function AlphaDivComputation(props: ComputationProps) {
  const { analysisState, computationAppOverview } = props;

  const computations = useMemo(() => {
    return analysisState.analysis?.descriptor.computations.filter(
      (computation) =>
        computation.descriptor.type === computationAppOverview.name
    );
  }, [analysisState]);
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
