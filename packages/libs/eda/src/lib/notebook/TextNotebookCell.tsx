import { NotebookCellComponentProps } from './Types';

export function TextNotebookCell(props: NotebookCellComponentProps<'text'>) {
  const { cell, isSubCell, isDisabled } = props;
  const { text } = cell;

  return (
    <details className={isSubCell ? 'subCell' : ''} open>
      <summary>{cell.title}</summary>
      <div className={isDisabled ? 'disabled' : ''}>{text}</div>
    </details>
  );
}
