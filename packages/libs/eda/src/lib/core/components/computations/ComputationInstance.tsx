import React, { useCallback, useMemo } from 'react';
import { useToggleStarredVariable } from '../../hooks/starredVariables';
import { Visualization } from '../../types/visualization';
import { VisualizationsContainer } from '../visualizations/VisualizationsContainer';
import { VisualizationType } from '../visualizations/VisualizationTypes';
import { ComputationProps } from './Types';

export interface Props extends ComputationProps {
  computationId: string;
  visualizationTypes: Record<string, VisualizationType>;
}

export function ComputationInstance(props: Props) {
  const {
    computationAppOverview,
    computationId,
    analysisState: { analysis, setComputations },
    totalCounts,
    filteredCounts,
    visualizationTypes,
  } = props;

  const computation = useMemo(() => {
    return analysis?.descriptor.computations.find(
      (computation) => computation.computationId === computationId
    );
  }, [computationId, analysis]);

  const toggleStarredVariable = useToggleStarredVariable(props.analysisState);

  const updateVisualizations = useCallback(
    (
      visualizations:
        | Visualization[]
        | ((visualizations: Visualization[]) => Visualization[])
    ) => {
      setComputations((computations) =>
        computations.map((computation) => {
          if (computation.computationId !== computationId) return computation;
          return {
            ...computation,
            visualizations:
              typeof visualizations === 'function'
                ? visualizations(computation.visualizations)
                : visualizations,
          };
        })
      );
    },
    [setComputations, computationId]
  );

  if (
    analysis == null ||
    computation == null ||
    computationAppOverview.visualizations == null
  )
    return null;

  return (
    <VisualizationsContainer
      computation={computation}
      visualizationsOverview={computationAppOverview.visualizations}
      visualizationTypes={visualizationTypes}
      updateVisualizations={updateVisualizations}
      filters={analysis.descriptor.subset.descriptor}
      starredVariables={analysis?.descriptor.starredVariables}
      toggleStarredVariable={toggleStarredVariable}
      totalCounts={totalCounts}
      filteredCounts={filteredCounts}
    />
  );
}
