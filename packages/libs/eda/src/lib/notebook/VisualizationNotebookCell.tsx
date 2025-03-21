import { useMemo } from 'react';
import { useEntityCounts } from '../core/hooks/entityCounts';
import { useStudyEntities } from '../core/hooks/workspace';
import { NotebookCellComponentProps } from './Types';
import { VariableLinkConfig } from '../core/components/VariableLink';
import FilterChipList from '../core/components/FilterChipList';
import Subsetting from '../workspace/Subsetting';

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
  return (
    <div>
      <h2>Plot here.</h2>
    </div>
  );
}
