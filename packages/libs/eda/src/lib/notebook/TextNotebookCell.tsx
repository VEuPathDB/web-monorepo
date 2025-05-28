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
      <div className={isDisabled ? 'disabled' : ''}>{text}</div>
    </details>
  );
}
