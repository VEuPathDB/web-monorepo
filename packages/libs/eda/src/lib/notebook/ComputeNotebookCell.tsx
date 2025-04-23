import { useCallback, useEffect, useMemo } from 'react';
import { useEntityCounts } from '../core/hooks/entityCounts';
import { useStudyEntities } from '../core/hooks/workspace';
import { NotebookCellComponentProps } from './Types';
import { isEqual } from 'lodash';
import { RunComputeButton } from '../core/components/computations/RunComputeButton';
import { useComputeJobStatus } from '../core/components/computations/ComputeJobStatusHook';

export function ComputeNotebookCell(
  props: NotebookCellComponentProps<'compute'>
) {
  const { analysisState, cell, updateCell } = props;
  const { analysis } = analysisState;
  if (analysis == null) throw new Error('Cannot find analysis.');
  // Eventually this cell should get the plugin list and use the name
  // from the analysis state computation id to get the plugin and the computationAppOverview
  const { computeId, computationAppOverview, computation, plugin } = cell;
  if (computation == null) throw new Error('Cannot find computation.');

  const entities = useStudyEntities();
  const totalCountsResult = useEntityCounts();
  const filteredCountsResult = useEntityCounts(
    analysis.descriptor.subset.descriptor
  );

  const changeConfigHandler = (propertyName: string, value?: any) => {
    if (!computation) return;
    if (!analysis.descriptor.computations[0]) return;

    // update the analysis state
    const updatedConfiguration = {
      // @ts-ignore
      ...computation.descriptor.configuration,
      [propertyName]: value,
    };

    const existingComputation =
      analysisState.analysis?.descriptor.computations.find(
        (comp) => isEqual(comp.descriptor.configuration, updatedConfiguration) //&&
        // c.descriptor.type === computation.descriptor.type
      );

    if (existingComputation) return;

    const updatedComputation = {
      ...computation,
      descriptor: {
        ...computation.descriptor,
        configuration: updatedConfiguration,
      },
    };

    analysisState.setComputations([updatedComputation]);
  };

  const { jobStatus, createJob } = useComputeJobStatus(
    analysis,
    computation,
    computationAppOverview?.computeName ?? ''
  );

  const isComputationConfigurationValid = !!plugin?.isConfigurationComplete(
    computation.descriptor.configuration
  );

  return computation ? (
    <div>
      <plugin.configurationComponent
        analysisState={analysisState}
        computation={computation}
        totalCounts={totalCountsResult}
        filteredCounts={filteredCountsResult}
        visualizationId="1"
        addNewComputation={(name, configuration) => console.log('hi')}
        computationAppOverview={computationAppOverview}
        geoConfigs={[]}
        changeConfigHandlerOverride={changeConfigHandler}
      />
      <RunComputeButton
        computationAppOverview={computationAppOverview}
        status={jobStatus}
        isConfigured={isComputationConfigurationValid}
        createJob={createJob}
      />
    </div>
  ) : (
    <div>
      <p>"Loading"</p>
    </div>
  );
}
