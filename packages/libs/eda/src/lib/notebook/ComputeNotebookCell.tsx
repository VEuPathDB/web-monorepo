import { useEffect, useMemo } from 'react';
import { useEntityCounts } from '../core/hooks/entityCounts';
import { useStudyEntities } from '../core/hooks/workspace';
import { NotebookCellComponentProps } from './Types';
import { createComputation } from '../core/components/computations/Utils';
import { DifferentialAbundanceConfig } from '../core/components/computations/plugins/differentialabundance';
import { DifferentialAbundanceConfiguration } from '../core/components/computations/plugins/differentialabundance';

export function ComputeNotebookCell(
  props: NotebookCellComponentProps<'compute'>
) {
  const { analysisState, cell, updateCell } = props;
  // Eventually this cell should get the plugin list and use the name
  // from the analysis state computation id to get the plugin and the computationAppOverview
  const { computeId, computationAppOverview, computation } = cell;
  const entities = useStudyEntities();
  const totalCountsResult = useEntityCounts();
  const filteredCountsResult = useEntityCounts(
    analysisState.analysis?.descriptor.subset.descriptor
  );

  // Needs to take the analysisState so that updates can go to the analysisState
  console.log('in compute', analysisState);
  return (
    <div>
      {/* <DifferentialAbundanceConfiguration
        analysisState={analysisState}
        computation={computation}
        totalCounts={totalCountsResult}
        filteredCounts={filteredCountsResult}
        visualizationId='1'
        addNewComputation={(name, configuration) => console.log('hi')}
        computationAppOverview={computationAppOverview}
        geoConfigs={[]}
      /> */}
    </div>
  );
}
