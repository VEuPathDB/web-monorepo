import React, { ReactNode } from 'react';
import { AnalysisState } from '../core/hooks/analysis';
import { VariableDescriptor } from '../core/types/variable';
import { ComputationAppOverview } from '../core/types/visualization';
import {
  Parameter,
  ParameterValues,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { BipartiteNetworkOptions } from '../core/components/visualizations/implementations/BipartiteNetworkVisualization';
import { VolcanoPlotOptions } from '../core/components/visualizations/implementations/VolcanoPlotVisualization';
import { CollectionVariableTreeNode } from '../core';
import { InputSpec } from '../core/components/visualizations/InputVariables';
import { DataElementConstraintRecord } from '../core/utils/data-element-constraints';
import useSnackbar from '@veupathdb/coreui/lib/components/notifications/useSnackbar';

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
  subCells?: NotebookCell[]; // Sub-cells that are part of the compute cell, e.g., visualizations or text cells.
}

export interface VisualizationNotebookCell
  extends NotebookCellBase<'visualization'> {
  visualizationId: string;
  visualizationName: string; // Name of the visualization plugin.
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
  isDisabled?: boolean; // Indicates if the cell is disabled (e.g., during loading).
}

// ---- WDK integration types ----

export type UpdateParamValue = (
  parameter: Parameter,
  newParamValue: string
) => void;

export interface WdkState {
  queryName: string;
  parameters: Parameter[];
  paramValues: ParameterValues;
  updateParamValue: UpdateParamValue;
  questionProperties: Record<string, string[]>;
  submitButtonText: string;
}

export type ReadinessContext =
  | { analysisState: AnalysisState; wdkState?: WdkState }
  | { analysisState?: AnalysisState; wdkState: WdkState };

// Type guards
export function isSubsettingCell(
  cell: NotebookCell
): cell is SubsettingNotebookCell {
  return cell.type === 'subset';
}
export function isComputeCell(cell: NotebookCell): cell is ComputeNotebookCell {
  return cell.type === 'compute';
}
export function isVisualizationCell(
  cell: NotebookCell
): cell is VisualizationNotebookCell {
  return cell.type === 'visualization';
}
export function isTextCell(cell: NotebookCell): cell is TextNotebookCell {
  return cell.type === 'text';
}

// ---- Notebook preset descriptor types ----

// this is currently not used but may be one day when we need to store user state
// that is outside AnalysisState and WdkState
export const NOTEBOOK_UI_STATE_KEY = '@@NOTEBOOK_WDK_PARAMS@@';

// The descriptors contain just enough information to render the cells when given the
// appropriate context, such as analysis state.
export type NotebookCellDescriptor =
  | VisualizationCellDescriptor
  | ComputeCellDescriptor
  | TextCellDescriptor
  | SubsetCellDescriptor
  | WdkParamCellDescriptor
  | SharedComputeInputsCellDescriptor;

export interface NotebookCellDescriptorBase<T extends string> {
  id: string; // Unique identifier for this cell. Used as key in stepNumbers map.
  type: T;
  title: string;
  cells?: NotebookCellDescriptor[];
  numberedHeader?: boolean; // If true, helperText will be rendered inside a NumberedHeader with an auto-computed step number
  helperText?: ReactNode; // Optional information to display above the cell. Instead of a full text cell, use this for quick help and titles.
  initialPanelState?: 'open' | 'closed'; // Initial open/closed state of the cell's ExpandablePanel. Defaults to 'open'.
}

export type EnqueueSnackbar = ReturnType<typeof useSnackbar>['enqueueSnackbar'];

export interface VisualizationCellDescriptor
  extends NotebookCellDescriptorBase<'visualization'> {
  visualizationName: string;
  visualizationId: string;
  // Custom function that allows us to override visualization Options from the notebook preset.
  // Useful for adding interactivity between the viz and other notebook cells.
  getVizPluginOptions?: (
    wdkState: WdkState,
    enqueueSnackbar: EnqueueSnackbar,
    stepNumbers?: Map<string, number>
  ) => Partial<BipartiteNetworkOptions> | Partial<VolcanoPlotOptions>; // We'll define this function custom for each notebook, so can expand output types as needed.
}

export interface ComputeCellDescriptor
  extends NotebookCellDescriptorBase<'compute'> {
  computationName: string;
  computationId: string;
  getAdditionalCollectionPredicate?: (
    projectId?: string
  ) => (variableCollection: CollectionVariableTreeNode) => boolean;
  hidden?: boolean; // Whether to hide this computation cell in the UI. Useful for computations where the entire configuration is already known.
  sharedInputNames?: string[]; // Input names managed by a SharedComputeInputsNotebookCell. Plugins render these as read-only.
  sharedInputsCellId?: string; // ID of the SharedComputeInputsCell that owns sharedInputNames. Used to auto-collapse this cell when shared inputs are not yet set.
}

export interface TextCellContext {
  analysisState: AnalysisState;
  wdkState?: WdkState;
  stepNumbers?: Map<string, number>;
}

export interface TextCellDescriptor extends NotebookCellDescriptorBase<'text'> {
  text: ReactNode | ((context: TextCellContext) => ReactNode);
  panelStateResolver?: (context: TextCellContext) => 'open' | 'closed';
}

export interface SubsetCellDescriptor
  extends NotebookCellDescriptorBase<'subset'> {}

export interface WdkParamCellDescriptor
  extends NotebookCellDescriptorBase<'wdkparam'> {
  paramNames: string[]; // Param names from the wdk query. These must match exactly or the notebook will err.
  requiredParamNames?: string[]; // Subset of paramNames that are required. Labels will be red with an asterisk until filled.
}

export interface SharedComputeInputsCellDescriptor
  extends NotebookCellDescriptorBase<'sharedcomputeinputs'> {
  computationIds: string[]; // Computation IDs whose configs will be updated (e.g. ['pca_1', 'de_1'])
  inputNames: string[]; // Config property names this cell manages (e.g. ['identifierVariable', 'valueVariable'])
  inputs: InputSpec[]; // Passed to InputVariables for rendering
  constraints?: DataElementConstraintRecord[];
  dataElementDependencyOrder?: string[][];
}

export type PresetNotebook = {
  name: string;
  displayName: string;
  projects: string[];
  cells: NotebookCellDescriptor[];
  header?:
    | string
    | ((context: {
        submitButtonText: string;
        stepNumbers: Map<string, number>;
      }) => string); // Optional header text for the notebook, to be displayed above the cells.
  isReady?: (context: ReadinessContext) => boolean;
};

// Descriptor type guards
export function isVisualizationCellDescriptor(
  cellDescriptor: NotebookCellDescriptorBase<string>
): cellDescriptor is VisualizationCellDescriptor {
  return cellDescriptor.type === 'visualization';
}

export function isTextCellDescriptor(
  cellDescriptor: NotebookCellDescriptorBase<string>
): cellDescriptor is TextCellDescriptor {
  return cellDescriptor.type === 'text';
}

export function isComputeCellDescriptor(
  cellDescriptor: NotebookCellDescriptorBase<string>
): cellDescriptor is ComputeCellDescriptor {
  return cellDescriptor.type === 'compute';
}

export function isSharedComputeInputsCellDescriptor(
  cellDescriptor: NotebookCellDescriptorBase<string>
): cellDescriptor is SharedComputeInputsCellDescriptor {
  return cellDescriptor.type === 'sharedcomputeinputs';
}

export function isSubsetCellDescriptor(
  cellDescriptor: NotebookCellDescriptorBase<string>
): cellDescriptor is SubsetCellDescriptor {
  return cellDescriptor.type === 'subset';
}
