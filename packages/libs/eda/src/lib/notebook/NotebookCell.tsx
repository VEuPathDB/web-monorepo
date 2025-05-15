import { AnalysisState } from '../core';
import { NotebookCell as NotebookCellType } from './Types';
import { SubsettingNotebookCell } from './SubsettingNotebookCell';
import { TextNotebookCell } from './TextNotebookCell';
import { VisualizationNotebookCell } from './VisualizationNotebookCell';
import { ComputeNotebookCell } from './ComputeNotebookCell';

interface Props {
  analysisState: AnalysisState;
  cell: NotebookCellType;
  updateCell: (cell: Partial<Omit<NotebookCellType, 'type'>>) => void;
  isSubCell?: boolean; // Indicates if this cell is a sub-cell of another cell. Affects styling.
  isDisabled?: boolean; // Indicates if the cell is disabled (e.g., during running a computation).
}

/**
 * Top-level component that delegates to imeplementations of NotebookCell variants.
 */
export function NotebookCell(props: Props) {
  const { cell, analysisState, updateCell, isSubCell, isDisabled } = props;
  switch (cell.type) {
    case 'subset':
      return (
        <SubsettingNotebookCell
          cell={cell}
          analysisState={analysisState}
          updateCell={updateCell}
          isSubCell={isSubCell ?? false}
          isDisabled={isDisabled ?? false}
        />
      );
    case 'text':
      return (
        <TextNotebookCell
          cell={cell}
          analysisState={analysisState}
          updateCell={updateCell}
          isSubCell={isSubCell ?? false}
          isDisabled={isDisabled ?? false}
        />
      );
    case 'visualization':
      return (
        <VisualizationNotebookCell
          cell={cell}
          analysisState={analysisState}
          updateCell={updateCell}
          isSubCell={isSubCell ?? false}
          isDisabled={isDisabled ?? false}
        />
      );
    case 'compute':
      return (
        <ComputeNotebookCell
          cell={cell}
          analysisState={analysisState}
          updateCell={updateCell}
          isSubCell={isSubCell ?? false}
          isDisabled={isDisabled ?? false}
        />
      );
    default:
      return null;
  }
}
