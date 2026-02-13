import ExpandablePanel from '@veupathdb/coreui/lib/components/containers/ExpandablePanel';
import { NotebookCellProps } from './NotebookCell';
import { TextCellDescriptor } from './NotebookPresets';
import { useMemo } from 'react';
import { NotebookCellPreHeader } from './NotebookCellPreHeader';

export function TextNotebookCell(props: NotebookCellProps<TextCellDescriptor>) {
  const { cell, isDisabled, analysisState, stepNumber } = props;

  const { text, title, getDynamicContent } = cell;

  const dynamicContent = useMemo(
    () => getDynamicContent?.(analysisState),
    [getDynamicContent, analysisState]
  );

  return (
    <>
      <NotebookCellPreHeader cell={cell} stepNumber={stepNumber} />
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
          {dynamicContent}
        </div>
      </ExpandablePanel>
    </>
  );
}
