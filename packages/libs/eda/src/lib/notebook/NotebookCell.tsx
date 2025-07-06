import { AnalysisState } from '../core';
import { SubsettingNotebookCell } from './SubsettingNotebookCell';
import { TextNotebookCell } from './TextNotebookCell';
import { VisualizationNotebookCell } from './VisualizationNotebookCell';
import { ComputeNotebookCell } from './ComputeNotebookCell';
import { NotebookCellDescriptor } from './NotebookPresets';
import { WdkParamNotebookCell } from './WdkParamNotebookCell';
import {
  Parameter,
  ParameterValues,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { UpdateWdkParamValue } from './EdaNotebookAnalysis';

export interface NotebookCellProps<T extends NotebookCellDescriptor> {
  analysisState: AnalysisState;
  cell: T;
  isDisabled?: boolean; // Indicates if the cell is disabled (e.g., before a computation is complete).
  expandedPanelState?: 'closed' | 'open'; // Indicates if the ExpandabelPanel is expanded in the UI.
  wdkParameters?: Parameter[];
  wdkParamValues?: ParameterValues;
  updateWdkParamValue?: UpdateWdkParamValue;
}

/**
 * Top-level component that delegates to imeplementations of NotebookCell variants.
 */
export function NotebookCell(props: NotebookCellProps<NotebookCellDescriptor>) {
  const { cell } = props;
  switch (cell.type) {
    case 'subset':
      return <SubsettingNotebookCell {...props} cell={cell} />;
    case 'text':
      return <TextNotebookCell {...props} cell={cell} />;
    case 'visualization':
      return <VisualizationNotebookCell {...props} cell={cell} />;
    case 'compute':
      return <ComputeNotebookCell {...props} cell={cell} />;
    case 'wdkparam':
      return <WdkParamNotebookCell {...props} cell={cell} />;
    default:
      return null;
  }
}
