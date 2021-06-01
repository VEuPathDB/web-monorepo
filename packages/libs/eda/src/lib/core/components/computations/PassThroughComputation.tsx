import React, { useCallback, useMemo } from 'react';
import { SessionState } from '../../hooks/session';
import { useToggleStarredVariable } from '../../hooks/starredVariables';
import {
  Visualization,
  ComputationAppOverview,
} from '../../types/visualization';
import { testVisualization } from '../visualizations/implementations/TestVisualization';
import { histogramVisualization } from '../visualizations/implementations/HistogramVisualization';
import {
  // contTableVisualization,
  twoByTwoVisualization,
} from '../visualizations/implementations/MosaicVisualization';
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
  histogram: histogramVisualization,
  twobytwo: twoByTwoVisualization,
  // conttable: contTableVisualization,
  scatterplot: scatterplotVisualization,
  lineplot: scatterplotVisualization,
  // placeholder for densityplot
  // densityplot: scatterplotVisualization,
};

export function PassThroughComputation(props: Props) {
  const { sessionState, computationAppOverview } = props;
  const { session, setVisualizations } = sessionState;

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

  const deleteVisualization = useCallback(
    (id: String) => {
      if (session == null) return;
      setVisualizations(session.visualizations.filter((v) => v.id !== id));
    },
    [session, setVisualizations]
  );

  const filters = useMemo(() => session?.filters ?? [], [session?.filters]);

  const toggleStarredVariable = useToggleStarredVariable(sessionState);

  if (session == null) return <div>Session not found</div>;
  return (
    <VisualizationsContainer
      computationId="pass-through"
      computations={[
        {
          id: 'pass-through',
          type: 'pass',
          displayName: 'Passthrough',
          configuration: undefined,
        },
      ]}
      visualizations={session.visualizations}
      visualizationsOverview={computationAppOverview.visualizations!}
      addVisualization={addVisualization}
      updateVisualization={updateVisualization}
      deleteVisualization={deleteVisualization}
      visualizationTypes={visualizationTypes}
      filters={filters}
      starredVariables={session.starredVariables}
      toggleStarredVariable={toggleStarredVariable}
    />
  );
}
