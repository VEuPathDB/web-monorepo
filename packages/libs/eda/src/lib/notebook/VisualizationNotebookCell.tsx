import { useCallback, useEffect } from 'react';
import { useEntityCounts } from '../core/hooks/entityCounts';
import { useStudyEntities } from '../core/hooks/workspace';
import { NotebookCellComponentProps } from './Types';
import { useGeoConfig } from '../core/hooks/geoConfig';
import { plugins } from '../core/components/computations/plugins';
import { PlotContainerStyleOverrides } from '../core/components/visualizations/VisualizationTypes';

export function VisualizationNotebookCell(
  props: NotebookCellComponentProps<'visualization'>
) {
  const { analysisState, cell, isSubCell, isDisabled } = props;
  const { analysis } = analysisState;
  if (analysis == null) throw new Error('Cannot find analysis.');
  const { updateVisualization } = analysisState;

  const entities = useStudyEntities();
  const geoConfigs = useGeoConfig(entities);
  const totalCountsResult = useEntityCounts();
  const filteredCountsResult = useEntityCounts(
    analysis.descriptor.subset.descriptor
  );

  const {
    visualizationId,
    computeId,
    computationAppOverview,
    visualizationName,
    computeJobStatus,
  } = cell;

  // use computeId to find the computation in the analysis state
  const computation = analysis.descriptor.computations.find(
    (comp) => comp.computationId === computeId
  );
  if (computation == null) throw new Error('Cannot find computation.');

  const appPlugin = plugins[computation.descriptor.type];
  const vizPlugin =
    appPlugin && appPlugin.visualizationPlugins[visualizationName];

  // If there's no visualization with this visualizationId, we
  // must create one.
  const existingVisualization = analysisState.analysis?.descriptor.computations
    .find((comp) => comp.computationId === computation.computationId)
    ?.visualizations.find((viz) => viz.visualizationId === visualizationId);

  useEffect(() => {
    if (existingVisualization == null) {
      const newVisualization = {
        visualizationId,
        displayName: 'Unnamed visualization',
        descriptor: {
          type: visualizationName,
          configuration: vizPlugin?.createDefaultConfig() ?? {},
        },
      };

      analysisState.addVisualization(
        computation.computationId,
        newVisualization
      );
    }
  }, [
    analysisState,
    computation.computationId,
    existingVisualization,
    vizPlugin,
    visualizationId,
    visualizationName,
  ]);

  const viz = computation.visualizations.find(
    (v) => v.visualizationId === visualizationId
  );

  if (computationAppOverview == null)
    throw new Error(
      'Visualizations associated with a computation must have an app overview.'
    );

  // regular updater (no ref)
  const updateConfiguration = useCallback(
    (configuration: unknown) => {
      if (viz != null) {
        updateVisualization({
          ...viz,
          descriptor: { ...viz.descriptor, configuration },
        });
      }
    },
    [updateVisualization, viz]
  );

  const vizOverview = computationAppOverview.visualizations.find(
    (v) => v.name === visualizationName
  );
  const constraints = vizOverview?.dataElementConstraints;
  const dataElementDependencyOrder = vizOverview?.dataElementDependencyOrder;

  // Bipartite networks are set to be extra wide, so we need to override
  // that behavior or they'll spill off the screen.
  const plotContainerStyleOverrides: PlotContainerStyleOverrides = {};
  if (viz?.descriptor.type === 'bipartitenetwork') {
    plotContainerStyleOverrides.width = 1100;
  }

  return viz ? (
    <details className={isSubCell ? 'subCell' : ''} open>
      <summary>{cell.title}</summary>
      <div className={isDisabled ? 'disabled' : ''}>
        {computation && vizPlugin && (
          <vizPlugin.fullscreenComponent
            options={vizPlugin.options}
            dataElementConstraints={constraints}
            dataElementDependencyOrder={dataElementDependencyOrder}
            visualization={viz}
            computation={computation}
            copmutationAppOverview={computationAppOverview}
            filters={[]} // issue #1413
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
    </details>
  ) : (
    <details>
      <summary>Loading</summary>
    </details>
  );
}
