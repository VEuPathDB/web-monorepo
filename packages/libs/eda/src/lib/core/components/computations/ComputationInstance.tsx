import { useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useToggleStarredVariable } from '../../hooks/starredVariables';
import { Computation } from '../../types/visualization';
import { VisualizationsContainer } from '../visualizations/VisualizationsContainer';
import { ComputationProps } from './Types';
import { plugins } from './plugins';
import { VisualizationPlugin } from '../visualizations/VisualizationPlugin';
import { AnalysisState } from '../../hooks/analysis';
import { useComputeJobStatus } from './ComputeJobStatusHook';

export interface Props extends ComputationProps {
  computationId: string;
  visualizationPlugins: Partial<Record<string, VisualizationPlugin>>;
  baseUrl?: string; // right now only defined when *not* using single app mode
  isSingleAppMode: boolean;
}

export function ComputationInstance(props: Props) {
  const {
    computationAppOverview,
    computationId,
    analysisState,
    totalCounts,
    filteredCounts,
    geoConfigs,
    visualizationPlugins,
    baseUrl,
    isSingleAppMode,
  } = props;

  const { analysis } = analysisState;

  const computation = useComputation(analysis, computationId);

  if (analysis == null) throw new Error('Cannot find analysis.');

  if (computation == null) throw new Error('Cannot find computation.');

  const toggleStarredVariable = useToggleStarredVariable(props.analysisState);

  const { url } = useRouteMatch();

  const { jobStatus, createJob } = useComputeJobStatus(
    analysis,
    computation,
    computationAppOverview.computeName
  );

  if (analysis == null || computation == null) return null;

  const showTitle =
    url.replace(/\/+$/, '').split('/').pop() === 'visualizations';

  // If we can have multiple app instances, add a title. Otherwise, use
  // the normal VisualizationsContainer.
  return (
    <div>
      {baseUrl && showTitle && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'flex-end',
            gap: '1em',
          }}
        >
          <AppTitle computation={computation} />
        </div>
      )}
      <VisualizationsContainer
        analysisState={analysisState}
        computationAppOverview={computationAppOverview}
        geoConfigs={geoConfigs}
        computation={computation}
        visualizationsOverview={computationAppOverview.visualizations}
        visualizationPlugins={visualizationPlugins}
        filters={analysis.descriptor.subset.descriptor}
        starredVariables={analysis?.descriptor.starredVariables}
        toggleStarredVariable={toggleStarredVariable}
        totalCounts={totalCounts}
        filteredCounts={filteredCounts}
        baseUrl={baseUrl}
        isSingleAppMode={isSingleAppMode}
        computeJobStatus={jobStatus}
        createComputeJob={createJob}
      />
    </div>
  );
}

// Title above each app in /visualizations
interface AppTitleProps {
  computation: Computation;
}

function AppTitle(props: AppTitleProps) {
  const { computation } = props;
  const plugin = plugins[computation.descriptor?.type];
  const ConfigDescription = plugin
    ? plugin.configurationDescriptionComponent
    : undefined;
  const { configuration } = computation.descriptor;

  return (
    <div style={{ lineHeight: 1.5 }}>
      {plugin
        ? ConfigDescription && (
            <ConfigDescription
              computation={
                configuration
                  ? computation
                  : {
                      ...computation,
                      descriptor: {
                        ...computation.descriptor,
                        configuration: {},
                      },
                    }
              }
            />
          )
        : null}
    </div>
  );
}

function useComputation(
  analysis: AnalysisState['analysis'],
  computationId: string
) {
  return useMemo(() => {
    const computation = analysis?.descriptor.computations.find(
      (computation) => computation.computationId === computationId
    );
    if (computation == null) return;
    const computePlugin = plugins[computation.descriptor.type];
    if (computePlugin == null) {
      throw new Error(
        `Unknown computation type: ${computation.descriptor.type}.`
      );
    }
    return computation;
  }, [analysis?.descriptor.computations, computationId]);
}
