import React, { useCallback, useMemo } from 'react';
import { SessionState } from '../../hooks/session';
import {
  Visualization,
  ComputationAppOverview,
} from '../../types/visualization';
import { testVisualization } from '../visualizations/implementations/TestVisualization';
import { histogramVisualization } from '../visualizations/implementations/HistogramVisualization';
import { VisualizationsContainer } from '../visualizations/VisualizationsContainer';
import { VisualizationType } from '../visualizations/VisualizationTypes';
import { scatterplotVisualization } from '../visualizations/implementations/ScatterplotVisualization';

interface Props {
  sessionState: SessionState;
  computationAppOverview: ComputationAppOverview;
}

/**
 * Maps a visualization plugin name to a `VisualizationType`
 */
const visualizationTypes: Record<string, VisualizationType> = {
  testVisualization,
  'date-histogram-bin-width': histogramVisualization,
  'numeric-histogram-bin-width': histogramVisualization,
  //DKDK
  scatterplot: scatterplotVisualization,
};

export function PassThroughComputation(props: Props) {
  const {
    sessionState: { session, setVisualizations },
    computationAppOverview,
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
      visualizationsOverview={computationAppOverview.visualizations!}
      addVisualization={addVisualization}
      updateVisualization={updateVisualization}
      visualizationTypes={visualizationTypes}
      filters={filters}
    />
  );
}
