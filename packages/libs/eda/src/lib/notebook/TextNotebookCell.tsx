import { useMemo } from 'react';
import { useEntityCounts } from '../core/hooks/entityCounts';
import { useStudyEntities } from '../core/hooks/workspace';
import { NotebookCellComponentProps } from './Types';
import { H6 } from '@veupathdb/coreui/lib/components/typography/headers';

export function TextNotebookCell(props: NotebookCellComponentProps<'text'>) {
  const { analysisState, cell, updateCell } = props;

  const entity = useStudyEntities()[0];
  const totalCountsResult = useEntityCounts();
  const filteredCountsResult = useEntityCounts(
    analysisState.analysis?.descriptor.subset.descriptor
  );
  return (
    <div>
      <H6>I'm the title</H6>
      <p>Lots of documentation that is helpful.</p>
      {/* Show totalCountsResult and filteredCountsResult */}
      <p>
        Total Counts Result:{' '}
        {totalCountsResult.value
          ? JSON.stringify(totalCountsResult.value)
          : 'No data available'}{' '}
      </p>
    </div>
  );
}
