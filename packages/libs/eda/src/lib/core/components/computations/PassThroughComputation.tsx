import React, { useCallback, useMemo } from 'react';

import { AnalysisState } from '../../hooks/analysis';
import { useToggleStarredVariable } from '../../hooks/starredVariables';
import {
  ComputationAppOverview,
  Visualization,
} from '../../types/visualization';
import { testVisualization } from '../visualizations/implementations/TestVisualization';
// import { histogramVisualization } from '../visualizations/implementations/HistogramVisualization';
import {
  contTableVisualization,
  twoByTwoVisualization,
} from '../visualizations/implementations/MosaicVisualization';
import { VisualizationsContainer } from '../visualizations/VisualizationsContainer';
import { VisualizationType } from '../visualizations/VisualizationTypes';
import { scatterplotVisualization } from '../visualizations/implementations/ScatterplotVisualization';
import { barplotVisualization } from '../visualizations/implementations/BarplotVisualization';
// import { boxplotVisualization } from '../visualizations/implementations/BoxplotVisualization';

interface Props {
  analysisState: AnalysisState;
  computationAppOverview: ComputationAppOverview;
}

/**
 * Maps a visualization plugin name to a `VisualizationType`
 */
const visualizationTypes: Record<string, VisualizationType> = {
  testVisualization,
  //  histogram: histogramVisualization,
  twobytwo: twoByTwoVisualization,
  conttable: contTableVisualization,
  scatterplot: scatterplotVisualization,
  // lineplot: scatterplotVisualization,
  // placeholder for densityplot
  // densityplot: scatterplotVisualization,
  barplot: barplotVisualization,
  //  boxplot: boxplotVisualization,
};

export function PassThroughComputation(props: Props) {
  const { analysisState, computationAppOverview } = props;
  const { analysis, setComputations } = analysisState;
  const filters = useMemo(() => analysis?.descriptor.subset.descriptor ?? [], [
    analysis?.descriptor.subset.descriptor,
  ]);

  const toggleStarredVariable = useToggleStarredVariable(analysisState);

  const computationLocation = useMemo(() => {
    const computations = analysis?.descriptor.computations;

    if (computations == null) {
      return undefined;
    }

    const computationIndex = computations.findIndex(
      ({ computationId }) => computationId === 'pass-through'
    );

    return computationIndex === -1
      ? undefined
      : {
          computationIndex,
          computation: computations[computationIndex],
        };
  }, [analysis?.descriptor.computations]);

  const updateVisualizations = useCallback(
    (
      visualizations:
        | Visualization[]
        | ((visualizations: Visualization[]) => Visualization[])
    ) => {
      if (computationLocation == null) {
        throw new Error('Computation not found');
      }

      const { computationIndex } = computationLocation;

      setComputations((computations) => [
        ...computations.slice(0, computationIndex),
        {
          ...computations[computationIndex],
          visualizations:
            typeof visualizations === 'function'
              ? visualizations(computations[computationIndex].visualizations)
              : visualizations,
        },
        ...computations.slice(computationIndex + 1),
      ]);
    },
    [setComputations, computationLocation]
  );

  if (analysis == null) return <div>Analysis not found</div>;
  if (computationLocation == null) return <div>Computation not found</div>;
  return (
    <VisualizationsContainer
      computation={computationLocation.computation}
      visualizationsOverview={computationAppOverview.visualizations!}
      updateVisualizations={updateVisualizations}
      visualizationTypes={visualizationTypes}
      filters={filters}
      starredVariables={analysis.descriptor.starredVariables}
      toggleStarredVariable={toggleStarredVariable}
    />
  );
}
