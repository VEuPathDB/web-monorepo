import ExpandablePanel from '@veupathdb/coreui/lib/components/containers/ExpandablePanel';
import { NotebookCellProps } from './NotebookCell';
import { TextCellDescriptor } from './NotebookPresets';

export function TextNotebookCell(props: NotebookCellProps<TextCellDescriptor>) {
  const { cell, isDisabled, analysisState } = props;

  const { text, title, getDynamicContent } = cell;

  return (
    <>
      {cell.helperText && (
        <div className="NotebookCellHelpText">
          <span>{cell.helperText}</span>
        </div>
      )}
      <ExpandablePanel
        title={title}
        subTitle={''}
        state="open"
        themeRole="primary"
      >
        <div
          className={'NotebookCellContent' + (isDisabled ? ' disabled' : '')}
        >
          {text}
          {getDynamicContent && getDynamicContent(analysisState)}
        </div>
      </ExpandablePanel>
    </>
  );
}
