import ExpandablePanel from '@veupathdb/coreui/lib/components/containers/ExpandablePanel';
import { NotebookCellProps } from './NotebookCell';
import { TextCellDescriptor } from './NotebookPresets';
import { useMemo } from 'react';
import { NotebookCellPreHeader } from './NotebookCellPreHeader';

export function TextNotebookCell(props: NotebookCellProps<TextCellDescriptor>) {
  const { cell, isDisabled, analysisState, wdkState, stepNumber } = props;

  const content = useMemo(
    () =>
      typeof cell.text === 'function'
        ? cell.text({ analysisState, wdkState })
        : cell.text,
    [cell.text, analysisState, wdkState]
  );

  return (
    <>
      <NotebookCellPreHeader cell={cell} stepNumber={stepNumber} />
      <ExpandablePanel
        title={cell.title}
        subTitle={''}
        state="open"
        themeRole="primary"
      >
        <div
          className={'NotebookCellContent' + (isDisabled ? ' disabled' : '')}
        >
          {content}
        </div>
      </ExpandablePanel>
    </>
  );
}
