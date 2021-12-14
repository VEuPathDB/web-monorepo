import React, { useCallback, useEffect, useMemo } from 'react';

import { useToggleStarredVariable } from '../../hooks/starredVariables';
import { Visualization } from '../../types/visualization';
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
import { ComputationProps } from './Types';

const COMPUTATION_ID = 'pass';

/**
 * Maps a visualization plugin name to a `VisualizationType`
 */
const visualizationTypes: Record<string, VisualizationType> = {
  testVisualization,
  histogram: histogramVisualization,
  twobytwo: twoByTwoVisualization,
  conttable: contTableVisualization,
  scatterplot: scatterplotVisualization,
  // lineplot: scatterplotVisualization,
  // placeholder for densityplot
  // densityplot: scatterplotVisualization,
  barplot: barplotVisualization,
  boxplot: boxplotVisualization,
};

export function PassThroughComputation(props: ComputationProps) {
  const {
    analysisState,
    computationAppOverview,
    totalCounts,
    filteredCounts,
  } = props;
  const { analysis, setComputations } = analysisState;
  const filters = useMemo(() => analysis?.descriptor.subset.descriptor ?? [], [
    analysis?.descriptor.subset.descriptor,
  ]);

  const toggleStarredVariable = useToggleStarredVariable(analysisState);

  const computationLocation = useMemo(() => {
    if (analysis == null) return undefined;

    const computations = analysis?.descriptor.computations;

    // find first "pass" computation
    const computationIndex = computations.findIndex(
      (computation) => computation.computationId === COMPUTATION_ID
    );

    return computationIndex === -1
      ? undefined
      : {
          computationIndex,
          computation: computations[computationIndex],
        };
  }, [analysis]);

  // only run this effect once, since it performs an async operation
  // which we only want to run once, under a certain condition on load
  useEffect(() => {
    if (computationLocation) return;
    setComputations((computations) =>
      computations.concat({
        computationId: COMPUTATION_ID,
        descriptor: {
          type: computationAppOverview.name,
          configuration: undefined,
        },
        visualizations: [],
      })
    );
  }, []);

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
      totalCounts={totalCounts}
      filteredCounts={filteredCounts}
    />
  );
}
