import { useCallback, useMemo } from 'react';
import { useEntityCounts } from '../core/hooks/entityCounts';
import { useDataClient, useStudyEntities } from '../core/hooks/workspace';
import { useGeoConfig } from '../core/hooks/geoConfig';
import { plugins } from '../core/components/computations/plugins';
import { PlotContainerStyleOverrides } from '../core/components/visualizations/VisualizationTypes';
import { NotebookCellProps } from './NotebookCell';
import { VisualizationCellDescriptor } from './NotebookPresets';
import { useCachedPromise } from '../core/hooks/cachedPromise';
import { useComputeJobStatus } from '../core/components/computations/ComputeJobStatusHook';
import ExpandablePanel from '@veupathdb/coreui/lib/components/containers/ExpandablePanel';
import useSnackbar from '@veupathdb/coreui/lib/components/notifications/useSnackbar';

export function VisualizationNotebookCell(
  props: NotebookCellProps<VisualizationCellDescriptor>
) {
  const { analysisState, cell, isDisabled, expandedPanelState, wdkState } =
    props;
  const { analysis, updateVisualization } = analysisState;
  if (analysis == null) throw new Error('Cannot find analysis.');
  if (wdkState == null) throw new Error('No WDK state.');

  const entities = useStudyEntities();
  const geoConfigs = useGeoConfig(entities);
  const totalCountsResult = useEntityCounts();
  const filteredCountsResult = useEntityCounts(
    analysis.descriptor.subset.descriptor
  );
  const { enqueueSnackbar } = useSnackbar();

  const { visualizationName, visualizationId, getVizPluginOptions } = cell;

  const { visualization, computation } =
    analysisState.getVisualizationAndComputation(visualizationId) ?? {};
  const computationName = computation?.descriptor.type;

  if (computation == null || computationName == null)
    throw new Error('Cannot find computation.');

  const appPlugin = plugins[computationName];
  const vizPlugin =
    appPlugin && appPlugin.visualizationPlugins[visualizationName];

  // fetch 'apps'
  const dataClient = useDataClient();
  const fetchApps = async () => {
    let { apps } = await dataClient.getApps();
    return { apps };
  };
  const apps = useCachedPromise(fetchApps, ['fetchApps']);
  const appOverview =
    apps && apps.value?.apps.find((app) => app.name === computationName);

  const { jobStatus: computeJobStatus } = useComputeJobStatus(
    analysis,
    computation,
    appOverview?.computeName ?? ''
  );

  if (appOverview == null)
    throw new Error(
      'Visualizations associated with a computation must have an app overview.'
    );

  const updateConfiguration = useCallback(
    (configuration: unknown) => {
      if (visualization != null) {
        updateVisualization({
          ...visualization,
          descriptor: {
            ...visualization.descriptor,
            configuration,
          },
        });
      }
    },
    [updateVisualization, visualization]
  );

  const vizOverview = appOverview.visualizations.find(
    (v) => v.name === visualizationName
  );
  const constraints = vizOverview?.dataElementConstraints;
  const dataElementDependencyOrder = vizOverview?.dataElementDependencyOrder;

  // Bipartite networks are set to be extra wide, so we need to override
  // that behavior or they'll spill off the screen.
  const plotContainerStyleOverrides: PlotContainerStyleOverrides = {};
  if (visualization?.descriptor.type === 'bipartitenetwork') {
    plotContainerStyleOverrides.width = 1100;
  }

  const vizOptions = useMemo(
    () => ({
      ...vizPlugin?.options,
      ...getVizPluginOptions?.(wdkState, enqueueSnackbar),
    }),
    [wdkState, enqueueSnackbar, getVizPluginOptions, vizPlugin?.options]
  );

  return visualization ? (
    <>
      {cell.helperText && (
        <div className="NotebookCellHelpText">
          <span>{cell.helperText}</span>
        </div>
      )}
      <ExpandablePanel
        title={cell.title}
        subTitle={''}
        state={expandedPanelState ?? 'open'}
        themeRole="primary"
      >
        <div
          className={'NotebookCellContent' + (isDisabled ? ' disabled' : '')}
        >
          {computation && vizPlugin && (
            <vizPlugin.fullscreenComponent
              options={vizOptions}
              dataElementConstraints={constraints}
              dataElementDependencyOrder={dataElementDependencyOrder}
              visualization={visualization}
              computation={computation}
              copmutationAppOverview={appOverview}
              filters={analysis.descriptor.subset.descriptor} // issue #1413
              starredVariables={[]} // to be implemented
              toggleStarredVariable={() => {}}
              updateConfiguration={updateConfiguration}
              totalCounts={totalCountsResult}
              filteredCounts={filteredCountsResult}
              geoConfigs={geoConfigs}
              otherVizOverviews={[]}
              computeJobStatus={computeJobStatus}
              hideInputsAndControls={false}
              plotContainerStyleOverrides={plotContainerStyleOverrides}
            />
          )}
        </div>
      </ExpandablePanel>
    </>
  ) : (
    <details>
      <summary>Loading</summary>
    </details>
  );
}
