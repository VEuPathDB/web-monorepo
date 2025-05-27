import { useEntityCounts } from '../core/hooks/entityCounts';
import { NotebookCellComponentProps } from './Types';
import { H6 } from '@veupathdb/coreui/lib/components/typography/headers';

export function TextNotebookCell(props: NotebookCellComponentProps<'text'>) {
  const { analysisState, cell, isSubCell, isDisabled } = props;
  const { text } = cell;
  const totalCountsResult = useEntityCounts();

  return (
    <details className={isSubCell ? 'subCell' : ''} open>
      <summary>{cell.title}</summary>
      <div className={isDisabled ? 'disabled' : ''}>
        <H6>I'm the title</H6>
        <p>This is my text:</p>
        {text}
        <p>
          Total Counts Result:{' '}
          {totalCountsResult.value
            ? JSON.stringify(totalCountsResult.value)
            : 'No data available'}{' '}
        </p>
      </div>
    </details>
  );
}
