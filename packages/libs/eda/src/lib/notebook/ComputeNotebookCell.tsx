import { useCallback, useEffect, useMemo } from 'react';
import { useEntityCounts } from '../core/hooks/entityCounts';
import { useDataClient, useStudyEntities } from '../core/hooks/workspace';
import { NotebookCellComponentProps } from './Types';
import { createComputation } from '../core/components/computations/Utils';
import {
  DifferentialAbundanceConfig,
  isCompleteDifferentialAbundanceConfig,
} from '../core/components/computations/plugins/differentialabundance';
import { DifferentialAbundanceConfiguration } from '../core/components/computations/plugins/differentialabundance';
import { isEqual } from 'lodash';
import { AppsResponse } from '../core/api/DataClient/types';
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
  const { computeId, computationAppOverview, computation } = cell;
  if (computation == null) throw new Error('Cannot find computation.');

  const entities = useStudyEntities();
  const totalCountsResult = useEntityCounts();
  const filteredCountsResult = useEntityCounts(
    analysis.descriptor.subset.descriptor
  );

  // Needs to take the analysisState so that updates can go to the analysisState
  console.log('in compute computatoin', analysis.descriptor.computations);

  const changeConfigHandler = (propertyName: string, value?: any) => {
    if (!computation) return;
    if (!analysis.descriptor.computations[0]) return;

    console.log('changeConfigHandler', propertyName, value);
    // update the analysis state
    const updatedConfiguration = {
      // @ts-ignore
      ...computation.descriptor.configuration,
      [propertyName]: value,
    };

    // const updatedConfiguration = { ...computation.descriptor.configuration, [propertyName]: value },

    // only update if there isn't already this computation around
    console.log(computation.descriptor.configuration);
    console.log(analysis.descriptor.computations[0]);
    console.log(updatedConfiguration);

    const existingComputation =
      analysisState.analysis?.descriptor.computations.find(
        (comp) => isEqual(comp.descriptor.configuration, updatedConfiguration) //&&
        // c.descriptor.type === computation.descriptor.type
      );
    console.log('existingComputation', existingComputation);
    if (existingComputation) return;

    // In eda we make a new computation. I don't want to do that I don't think
    // const newComputation = createComputation(
    //   computation.descriptor.type,
    //   updatedConfiguration,
    //   analysisState.analysis?.descriptor.computations,
    //   []
    // );
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

  return computation ? (
    <div>
      <DifferentialAbundanceConfiguration
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
        isConfigured={isCompleteDifferentialAbundanceConfig(
          computation.descriptor.configuration as DifferentialAbundanceConfig
        )}
        createJob={createJob}
      />
    </div>
  ) : (
    <div>
      <p>"Loading"</p>
    </div>
  );
}
