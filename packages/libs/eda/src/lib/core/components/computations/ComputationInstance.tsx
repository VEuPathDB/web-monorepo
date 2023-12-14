import { useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useToggleStarredVariable } from '../../hooks/starredVariables';
import { Computation } from '../../types/visualization';
import { VisualizationsContainer } from '../visualizations/VisualizationsContainer';
import { ComputationPlugin, ComputationProps } from './Types';
import { plugins } from './plugins';
import { VisualizationPlugin } from '../visualizations/VisualizationPlugin';
import { AnalysisState } from '../../hooks/analysis';
import { useComputeJobStatus } from './ComputeJobStatusHook';
import { Filter } from '../../types/filter';
import { useStudyMetadata } from '../../hooks/workspace';

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
  const { rootEntity } = useStudyMetadata();

  const _computation = useComputation(analysis, computationId);

  if (analysis == null) throw new Error('Cannot find analysis.');

  if (_computation == null) throw new Error('Cannot find computation.');

  const plugin = plugins[_computation.descriptor.type];

  if (plugin == null) throw new Error('Cannot find plugin for computation.');

  // handle undefined computation configurations
  const computation =
    _computation.descriptor.configuration == null
      ? {
          ..._computation,
          descriptor: {
            ..._computation.descriptor,
            configuration: plugin.createDefaultConfiguration(rootEntity),
          },
        }
      : _computation;

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

  const filters = analysisState.analysis?.descriptor.subset.descriptor ?? [];

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
          <AppTitle
            computation={computation}
            filters={filters}
            plugin={plugin}
          />
        </div>
      )}
      <VisualizationsContainer
        analysisState={analysisState}
        computationAppOverview={computationAppOverview}
        geoConfigs={geoConfigs}
        computation={computation}
        computationPlugin={plugin}
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
  filters: Filter[];
  plugin: ComputationPlugin;
}

function AppTitle(props: AppTitleProps) {
  const { computation, filters, plugin } = props;
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
              filters={filters}
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
