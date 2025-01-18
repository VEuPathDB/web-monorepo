import { AnalysisState } from '../core';
import { NotebookCell as NotebookCellType } from './Types';
import { SubsettingNotebookCell } from './SubsettingNotebookCell';

interface Props {
  analysisState: AnalysisState;
  cell: NotebookCellType;
  updateCell: (cell: Partial<Omit<NotebookCellType, 'type'>>) => void;
}

/**
 * Top-level component that delegates to imeplementations of NotebookCell variants.
 */
export function NotebookCell(props: Props) {
  const { cell, analysisState, updateCell } = props;
  switch (cell.type) {
    case 'subset':
      return (
        <SubsettingNotebookCell
          cell={cell}
          analysisState={analysisState}
          updateCell={updateCell}
        />
      );
    default:
      return null;
  }
}
