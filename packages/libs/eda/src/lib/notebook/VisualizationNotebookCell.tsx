import { useEffect, useMemo } from 'react';
import { useEntityCounts } from '../core/hooks/entityCounts';
import { useStudyEntities } from '../core/hooks/workspace';
import { NotebookCellComponentProps } from './Types';
import { createComputation } from '../core/components/computations/Utils';
import { DifferentialAbundanceConfig } from '../core/components/computations/plugins/differentialabundance';

export function VisualizationNotebookCell(
  props: NotebookCellComponentProps<'visualization'>
) {
  const { analysisState, cell, updateCell } = props;
  const { visualizationId } = cell;
  const entities = useStudyEntities();
  const totalCountsResult = useEntityCounts();
  const filteredCountsResult = useEntityCounts(
    analysisState.analysis?.descriptor.subset.descriptor
  );

  // const computation = useMemo(() => {
  //   return createComputation(
  //     'differentialabundance',
  //     {} as DifferentialAbundanceConfig,
  //     [],
  //     []
  //   );
  // }, []);

  // useEffect(() => {
  //   if (!computation) {return;}
  //   console.log(computation);
  //   analysisState.setComputations([computation]);
  // }, [analysisState, computation]);

  // Needs to take the analysisState so that updates can go to the analysisState
  console.log('in viz', analysisState);
  return (
    <div>
      <h2>Plot here.</h2>
    </div>
  );
}
