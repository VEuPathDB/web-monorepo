import React, { useCallback, useMemo } from 'react';
import { SessionState, useSession } from '../../hooks/session';
import { Visualization } from '../../types/visualization';
import { testVisualization } from '../visualizations/implementations/TestVisualization';
import { histogramVisualization } from '../visualizations/implementations/HistogramVisualization';
import { VisualizationsContainer } from '../visualizations/VisualizationsContainer';
import { VisualizationType } from '../visualizations/VisualizationTypes';

interface Props {
  sessionState: SessionState;
}

const visualizationTypes: VisualizationType[] = [
  testVisualization,
  histogramVisualization,
];

export function PassThroughComputation(props: Props) {
  const {
    sessionState: { session, setVisualizations },
  } = props;
  const addVisualization = useCallback(
    (visualization: Visualization) => {
      setVisualizations([...(session?.visualizations ?? []), visualization]);
    },
    [setVisualizations, session]
  );
  const updateVisualization = useCallback(
    (visualization: Visualization) => {
      setVisualizations([
        ...(session?.visualizations.filter(
          (viz) => viz.id !== visualization.id
        ) ?? []),
        visualization,
      ]);
    },
    [setVisualizations, session]
  );

  const filters = useMemo(() => session?.filters ?? [], [session?.filters]);
  if (session == null) return <div>Session not found</div>;
  return (
    <VisualizationsContainer
      computationId="pass-through"
      computations={[
        {
          id: 'pass-through',
          type: 'pass',
          configuration: undefined,
        },
      ]}
      visualizations={session.visualizations}
      addVisualization={addVisualization}
      updateVisualization={updateVisualization}
      visualizationTypes={visualizationTypes}
      filters={filters}
    />
  );
}
