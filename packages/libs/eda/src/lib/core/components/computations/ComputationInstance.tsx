import { useCallback, useMemo } from 'react';
import { useToggleStarredVariable } from '../../hooks/starredVariables';
import { Computation, Visualization } from '../../types/visualization';
import { VisualizationsContainer } from '../visualizations/VisualizationsContainer';
import { VisualizationType } from '../visualizations/VisualizationTypes';
import { ComputationProps } from './Types';
import { useRouteMatch } from 'react-router-dom';

export interface Props extends ComputationProps {
  computationId: string;
  visualizationTypes: Record<string, VisualizationType>;
  baseUrl?: string; // right now only defined when *not* using single app mode
  singleAppMode: string | undefined;
}

export function ComputationInstance(props: Props) {
  const {
    computationAppOverview,
    computationId,
    analysisState,
    totalCounts,
    filteredCounts,
    geoConfigs,
    visualizationTypes,
    baseUrl,
    singleAppMode,
  } = props;

  const { analysis, setComputations } = analysisState;

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

  // If we can have multiple app instances, add a title. Otherwise, use
  // the normal VisualizationsContainer.
  return (
    <div>
      {baseUrl && (
        <AppTitle
          computation={computation}
          condensed={
            url.replace(/\/+$/, '').split('/').pop() === 'visualizations'
          }
        />
      )}
      <VisualizationsContainer
        analysisState={analysisState}
        computationAppOverview={computationAppOverview}
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
        showHeading={!singleAppMode}
      />
    </div>
  );
}

// Title above each app in /visualizations
interface AppTitleProps {
  computation: Computation;
  condensed: boolean;
}

// We expect two different types of app titles: one in /visualizations that labels each app's row
// and one just below the navigation when we're working on a viz within an app. The former
// is the "condensed" version. May make sense to break into two components when
// further styling is applied?
function AppTitle(props: AppTitleProps) {
  const { computation, condensed } = props;
  const splitDisplayName = computation.displayName
    ? computation.displayName.split('&;&')
    : '';

  return condensed ? (
    <div style={{ lineHeight: 1.5 }}>
      {computation.descriptor.configuration ? (
        <>
          <h4 style={{ padding: '15px 0 0 0', marginLeft: 20 }}>
            Data: <span style={{ fontWeight: 300 }}>{splitDisplayName[0]}</span>
          </h4>
          <h4 style={{ padding: 0, marginLeft: 20 }}>
            Method:{' '}
            <span style={{ fontWeight: 300 }}>
              {splitDisplayName[1][0].toUpperCase() +
                splitDisplayName[1].slice(1)}
            </span>
          </h4>
        </>
      ) : null}
    </div>
  ) : null;
}
