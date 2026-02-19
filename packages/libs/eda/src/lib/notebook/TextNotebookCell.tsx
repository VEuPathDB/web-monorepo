import ExpandablePanel from '@veupathdb/coreui/lib/components/containers/ExpandablePanel';
import { NotebookCellProps } from './NotebookCell';
import { TextCellDescriptor } from './Types';
import { useState, useEffect, useMemo } from 'react';
import { NotebookCellPreHeader } from './NotebookCellPreHeader';

export function TextNotebookCell(props: NotebookCellProps<TextCellDescriptor>) {
  const { cell, isDisabled, analysisState, wdkState, stepNumber, stepNumbers } =
    props;

  const content = useMemo(
    () =>
      typeof cell.text === 'function'
        ? cell.text({ analysisState, wdkState, stepNumbers })
        : cell.text,
    [cell.text, analysisState, wdkState, stepNumbers]
  );

  const resolvedState = cell.panelStateResolver
    ? cell.panelStateResolver({ analysisState, wdkState, stepNumbers })
    : cell.initialPanelState ?? 'open';

  const [panelState, setPanelState] = useState<'open' | 'closed'>(
    resolvedState
  );

  useEffect(() => {
    setPanelState(resolvedState);
  }, [resolvedState]);

  return (
    <>
      <NotebookCellPreHeader cell={cell} stepNumber={stepNumber} />
      <ExpandablePanel
        title={cell.title}
        subTitle={''}
        state={panelState}
        onStateChange={setPanelState}
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
