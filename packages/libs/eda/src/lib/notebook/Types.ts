import React from 'react';
import { ComputationPlugin } from '../core/components/computations/Types';
import { VisualizationPlugin } from '../core/components/visualizations/VisualizationPlugin';
import { AnalysisState } from '../core/hooks/analysis';
import { VariableDescriptor } from '../core/types/variable';
import { ComputationAppOverview } from '../core/types/visualization';

export interface NotebookCellBase<T extends string> {
  type: T;
  title: string | React.ReactNode; // Title of the cell, can be a string or a React node for more complex titles.
}

export interface SubsettingNotebookCell extends NotebookCellBase<'subset'> {
  selectedVariable?: Partial<VariableDescriptor>;
}

export interface ComputeNotebookCell extends NotebookCellBase<'compute'> {
  computeId: string;
  computationAppOverview: ComputationAppOverview;
  createJob?: () => void;
  plugin: ComputationPlugin; // perhaps we can use the computeId to look through a list of plugins and find the right one?
  subCells?: NotebookCell[]; // Sub-cells that are part of the compute cell, e.g., visualizations or text cells.
}

export interface VisualizationNotebookCell
  extends NotebookCellBase<'visualization'> {
  visualizationId: string;
  plugin: VisualizationPlugin;
  computeId: string; // Used to link the visualization to a specific compute cell.
  computationAppOverview: ComputationAppOverview;
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
  isSubCell?: boolean; // Indicates if this cell is a sub-cell of another cell. Affects styling.
}
