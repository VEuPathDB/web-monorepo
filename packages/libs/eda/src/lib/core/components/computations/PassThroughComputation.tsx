import React, { useCallback, useMemo } from 'react';
import { AnalysisState } from '../../hooks/analysis';
import { useToggleStarredVariable } from '../../hooks/starredVariables';
import {
  Visualization,
  ComputationAppOverview,
} from '../../types/visualization';
import { testVisualization } from '../visualizations/implementations/TestVisualization';
import { histogramVisualization } from '../visualizations/implementations/HistogramVisualization';
import {
  contTableVisualization,
  twoByTwoVisualization,
} from '../visualizations/implementations/MosaicVisualization';
import { VisualizationsContainer } from '../visualizations/VisualizationsContainer';
import { VisualizationType } from '../visualizations/VisualizationTypes';
import { scatterplotVisualization } from '../visualizations/implementations/ScatterplotVisualization';
import { barplotVisualization } from '../visualizations/implementations/BarplotVisualization';
import { boxplotVisualization } from '../visualizations/implementations/BoxplotVisualization';

interface Props {
  analysisState: AnalysisState;
  computationAppOverview: ComputationAppOverview;
}

/**
 * Maps a visualization plugin name to a `VisualizationType`
 */
const visualizationTypes: Record<string, VisualizationType> = {
  testVisualization,
  histogram: histogramVisualization,
  twobytwo: twoByTwoVisualization,
  conttable: contTableVisualization,
  scatterplot: scatterplotVisualization,
  lineplot: scatterplotVisualization,
  // placeholder for densityplot
  // densityplot: scatterplotVisualization,
  barplot: barplotVisualization,
  boxplot: boxplotVisualization,
};

export function PassThroughComputation(props: Props) {
  const { analysisState, computationAppOverview } = props;
  const { analysis, setVisualizations } = analysisState;
  const addVisualization = useCallback(
    (visualization: Visualization) => {
      setVisualizations([...(analysis?.visualizations ?? []), visualization]);
    },
    [setVisualizations, analysis]
  );
  const updateVisualization = useCallback(
    (visualization: Visualization) => {
      setVisualizations([
        ...(analysis?.visualizations.filter(
          (viz) => viz.id !== visualization.id
        ) ?? []),
        visualization,
      ]);
    },
    [setVisualizations, analysis]
  );

  const deleteVisualization = useCallback(
    (id: String) => {
      if (analysis == null) return;
      setVisualizations(analysis.visualizations.filter((v) => v.id !== id));
    },
    [analysis, setVisualizations]
  );

  const filters = useMemo(() => analysis?.filters ?? [], [analysis?.filters]);

  const toggleStarredVariable = useToggleStarredVariable(analysisState);

  if (analysis == null) return <div>Analysis not found</div>;
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
      visualizations={analysis.visualizations}
      visualizationsOverview={computationAppOverview.visualizations!}
      addVisualization={addVisualization}
      updateVisualization={updateVisualization}
      deleteVisualization={deleteVisualization}
      visualizationTypes={visualizationTypes}
      filters={filters}
      starredVariables={analysis.starredVariables}
      toggleStarredVariable={toggleStarredVariable}
    />
  );
}
