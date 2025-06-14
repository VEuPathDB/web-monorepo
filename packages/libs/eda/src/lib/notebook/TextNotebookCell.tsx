import { NotebookCellProps } from './NotebookCell';
import { TextCellDescriptor } from './NotebookPresets';

export function TextNotebookCell(props: NotebookCellProps<TextCellDescriptor>) {
  const { cell, isSubCell, isDisabled } = props;

  const { text, title } = cell;

  return (
    <details className={isSubCell ? 'subCell' : ''} open>
      <summary>{title}</summary>
      <div className={isDisabled ? 'disabled' : ''}>{text}</div>
    </details>
  );
}
