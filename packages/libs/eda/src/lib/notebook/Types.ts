import { ComputationPlugin } from '../core/components/computations/Types';
import { VisualizationPlugin } from '../core/components/visualizations/VisualizationPlugin';
import { AnalysisState } from '../core/hooks/analysis';
import { VariableDescriptor } from '../core/types/variable';
import {
  Computation,
  ComputationAppOverview,
} from '../core/types/visualization';

export interface NotebookCellBase<T extends string> {
  type: T;
  title: string;
}

export interface SubsettingNotebookCell extends NotebookCellBase<'subset'> {
  selectedVariable?: Partial<VariableDescriptor>;
}

export interface ComputeNotebookCell extends NotebookCellBase<'compute'> {
  computeId: string;
  computationAppOverview: ComputationAppOverview;
  computation: Computation;
  createJob?: () => void;
  plugin: ComputationPlugin; // perhaps we can use the computeId to look through a list of plugins and find the right one?
}

export interface VisualizationNotebookCell
  extends NotebookCellBase<'visualization'> {
  visualizationId: string;
  plugin: VisualizationPlugin;
  computeId: string; // Used to link the visualization to a specific compute cell.
  computationAppOverview: ComputationAppOverview;
  computation: Computation; // The computation that this visualization is based on.
}

export interface TextNotebookCell extends NotebookCellBase<'text'> {
  text: string;
}

export type NotebookCell =
  | SubsettingNotebookCell
  | ComputeNotebookCell
  | VisualizationNotebookCell
  | TextNotebookCell;

type FindByType<Union, Type> = Union extends { type: Type } ? Union : never;

export type NotebookCellOfType<T extends NotebookCell['type']> = FindByType<
  NotebookCell,
  T
>;

export interface NotebookCellComponentProps<T extends NotebookCell['type']> {
  analysisState: AnalysisState;
  cell: NotebookCellOfType<T>;
  // Allow partial updates, but don't allow `type` to be changed.
  updateCell: (cell: Omit<Partial<NotebookCellOfType<T>>, 'type'>) => void;
}
