import { string } from 'fp-ts';
import React, { useCallback, useMemo } from 'react';
import { useToggleStarredVariable } from '../../hooks/starredVariables';
import {
  Computation,
  ComputationAppOverview,
  Visualization,
} from '../../types/visualization';
import { VisualizationsContainer } from '../visualizations/VisualizationsContainer';
import { VisualizationType } from '../visualizations/VisualizationTypes';
import { ComputationProps } from './Types';
import { Link, useRouteMatch } from 'react-router-dom';

export interface Props extends ComputationProps {
  computationId: string;
  visualizationTypes: Record<string, VisualizationType>;
  baseUrl?: string; // right now only defined when *not* using single app mode
}

export function ComputationInstance(props: Props) {
  const {
    computationAppOverview,
    computationId,
    analysisState: { analysis, setComputations },
    totalCounts,
    filteredCounts,
    geoConfigs,
    visualizationTypes,
    baseUrl, // Only set when we are *not* using single app mode
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

  const { url } = useRouteMatch();

  if (
    analysis == null ||
    computation == null ||
    computationAppOverview.visualizations == null
  )
    return null;

  return (
    <div>
      {baseUrl &&
        (url.replace(/\/+$/, '').split('/').pop() === 'visualizations' ? (
          <AppTitle
            computation={computation}
            computationAppOverview={computationAppOverview}
            condensed={true}
          />
        ) : (
          <AppTitle
            computation={computation}
            computationAppOverview={computationAppOverview}
            condensed={false}
          />
        ))}
      <VisualizationsContainer
        geoConfigs={geoConfigs}
        computation={computation}
        visualizationsOverview={computationAppOverview.visualizations}
        visualizationTypes={visualizationTypes}
        updateVisualizations={updateVisualizations}
        filters={analysis.descriptor.subset.descriptor}
        starredVariables={analysis?.descriptor.starredVariables}
        toggleStarredVariable={toggleStarredVariable}
        totalCounts={totalCounts}
        filteredCounts={filteredCounts}
        baseUrl={baseUrl}
      />
    </div>
  );
}

// Title above each app in /visualizations
interface AppTitleProps {
  computation: Computation;
  computationAppOverview: ComputationAppOverview;
  condensed: boolean;
}

// We expect two different types of app titles: one in /visualizations that labels each app's row
// and one just below the navigation when we're working on a viz within an app. The former
// is the "condensed" version. May make sense to break into two components when
// further styling is applied?
function AppTitle(props: AppTitleProps) {
  const { computation, computationAppOverview, condensed } = { ...props };
  const style = {
    borderRadius: 5,
    paddingTop: 10,
    paddingRight: 35,
    paddingBottom: 10,
    paddingLeft: 20,
    backgroundColor: 'lightblue',
    margin: 'auto',
    marginTop: 10,
  };
  return condensed ? (
    <div>
      <h3>
        {computation.displayName} <i className="fa fa-cog"></i>{' '}
        <i className="fa fa-clone"></i> <i className="fa fa-trash"></i>
      </h3>
      <h4>
        <i>{computationAppOverview.displayName}</i>
      </h4>
    </div>
  ) : (
    <div style={style}>
      <h3>
        {computation.displayName} <i className="fa fa-cog"></i>{' '}
        <i className="fa fa-clone"></i> <i className="fa fa-trash"></i>
      </h3>
      <h4>{computationAppOverview.displayName}</h4>
    </div>
  );
}
