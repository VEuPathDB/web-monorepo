import { useCallback, useEffect, useMemo } from 'react';
import { useEntityCounts } from '../core/hooks/entityCounts';
import { useStudyEntities } from '../core/hooks/workspace';
import { NotebookCellComponentProps } from './Types';
import { createComputation } from '../core/components/computations/Utils';
import { DifferentialAbundanceConfig } from '../core/components/computations/plugins/differentialabundance';
import { useGeoConfig } from '../core/hooks/geoConfig';
import { useComputeJobStatus } from '../core/components/computations/ComputeJobStatusHook';
import { Computation } from '../core/types/visualization';

export function VisualizationNotebookCell(
  props: NotebookCellComponentProps<'visualization'>
) {
  const { analysisState, cell, updateCell } = props;
  const { analysis } = analysisState;
  if (analysis == null) throw new Error('Cannot find analysis.');
  const { updateVisualization } = analysisState;

  const entities = useStudyEntities();
  const geoConfigs = useGeoConfig(entities);
  const totalCountsResult = useEntityCounts();
  const filteredCountsResult = useEntityCounts(
    analysis.descriptor.subset.descriptor
  );

  // Eventually this cell should get the plugin list and use the name
  // from the analysis state computation id to get the plugin and the computationAppOverview
  const { visualizationId, computeId, plugin, computationAppOverview } = cell;

  // use computeId to find the computation in the analysis state
  const computation = analysis.descriptor.computations.find(
    (comp) => comp.computationId === computeId
  );
  if (computation == null) throw new Error('Cannot find computation.');

  const { jobStatus, createJob } = useComputeJobStatus(
    analysis,
    computation as Computation,
    computationAppOverview?.computeName ?? ''
  );

  // SOON Get the configuration and ask if the job is done
  // const computeConfig = computation.descriptor.configuration;
  const viz = computation.visualizations.find(
    (v) => v.visualizationId === visualizationId
  );
  if (viz == null) throw new Error('Cannot find visualization.');
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
        // and then update the cell?
        // const newComputation = analysis.descriptor.computations[0];
        // updateCell({
        //   computation: newComputation
        // });
      }
    },
    [updateVisualization, viz, analysis]
  );

  const vizOverview = computationAppOverview.visualizations.find(
    (v) => v.name === viz.descriptor.type
  );
  const constraints = vizOverview?.dataElementConstraints;
  const dataElementDependencyOrder = vizOverview?.dataElementDependencyOrder;

  return (
    <div>
      <h2>Plot here.</h2>
      {/* <plugin.fullscreenComponent /> */}
      {computation && (
        <plugin.fullscreenComponent
          options={plugin.options}
          dataElementConstraints={constraints}
          dataElementDependencyOrder={dataElementDependencyOrder}
          visualization={viz}
          computation={computation}
          copmutationAppOverview={computationAppOverview}
          filters={[]} // to be implemented
          starredVariables={[]} // to be implemented
          toggleStarredVariable={() => {}}
          updateConfiguration={updateConfiguration}
          // updateThumbnail={
          //   disableThumbnailCreation ? undefined : updateThumbnail
          // }
          totalCounts={totalCountsResult}
          filteredCounts={filteredCountsResult}
          geoConfigs={geoConfigs}
          otherVizOverviews={[]} // to be implemented
          computeJobStatus={jobStatus}
          hideInputsAndControls={false}
          // plotContainerStyleOverrides={plotContainerStyleOverrides}
        />
      )}
    </div>
  );
}
