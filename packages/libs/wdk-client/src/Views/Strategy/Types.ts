import { RecordClass, Question } from 'wdk-client/Utils/WdkModel';
import { Step } from 'wdk-client/Utils/WdkUser';

export interface PartialUiStepTree {
  color?: string;
  step: Step;
  recordClass?: RecordClass;
  question?: Question;
  primaryInput?: PartialUiStepTree;
  secondaryInput?: PartialUiStepTree;
  nestedControlStep?: Step;
  isNested: boolean;
  slotNumber: number;
}

export function isCompleteUiStepTree(stepTree: PartialUiStepTree): stepTree is UiStepTree {
  return stepTree.recordClass != null && stepTree.question != null;
}

export interface UiStepTree {
  color?: string;
  step: Step;
  recordClass: RecordClass;
  question: Question;
  primaryInput?: PartialUiStepTree;
  secondaryInput?: PartialUiStepTree;
  nestedControlStep?: Step;
  isNested: boolean;
  slotNumber: number;
}

// specialized UiStepTree types and guards

export interface PartialLeafUiStepTree extends PartialUiStepTree {
  primaryInput: undefined;
  secondaryInput: undefined;
}

export function isPartialCombineUiStepTree(stepTree: PartialUiStepTree): stepTree is PartialLeafUiStepTree {
  return stepTree.primaryInput != null && stepTree.secondaryInput != null;
}

export interface LeafUiStepTree extends UiStepTree {
  primaryInput: undefined;
  secondaryInput: undefined;
}

export function isLeafUiStepTree(stepTree: UiStepTree): stepTree is LeafUiStepTree {
  return stepTree.primaryInput == null && stepTree.secondaryInput == null;
}

export interface TransformUiStepTree extends UiStepTree {
  primaryInput: PartialUiStepTree;
  secondaryInput: undefined;
}

export function isTransformUiStepTree(stepTree: UiStepTree): stepTree is TransformUiStepTree {
  return stepTree.primaryInput != null && stepTree.secondaryInput == null;
}

export interface CombineUiStepTree extends UiStepTree {
  primaryInput: PartialUiStepTree;
  secondaryInput: PartialUiStepTree;
}

export function isCombineUiStepTree(stepTree: UiStepTree): stepTree is CombineUiStepTree {
  return stepTree.primaryInput != null && stepTree.secondaryInput != null;
}

export interface StepBoxesProps {
  stepTree: PartialUiStepTree;
  nestedStrategyBranchToRename?: number;
  isDeleteable?: boolean;
  stepDetailVisibility?: number;
  setStepDetailVisibility: (stepId?: number) => void;
  setReviseFormStepId: (stepId?: number) => void;
  onShowInsertStep: (addType: AddType) => void;
  onHideInsertStep: () => void;
  onMakeNestedStrategy: (branchId: number) => void;
  onMakeUnnestedStrategy: (branchId: number) => void;
  onExpandNestedStrategy: (stepId: number) => void;
  onCollapseNestedStrategy: (stepId: number) => void;
  onRenameStep: (stepId: number, newName: string) => void;
  onRenameNestedStrategy: (branchStepId: number, newName: string) => void;
  onAnalyzeStep: () => void;
  onDeleteStep: (stepId: number) => void;
}

export interface StepBoxProps<T extends UiStepTree = UiStepTree> {
  stepTree: T;
  isNested: boolean;
  isExpanded: boolean;
  isDeleteable: boolean;
  isAnalyzable: boolean;
  isDetailVisible: boolean;
  setDetailVisibility: (isVisible: boolean) => void;
  renameStep: (newName: string) => void;
  makeNestedStrategy: () => void;
  makeUnnestStrategy: () => void;
  collapseNestedStrategy: () => void;
  expandNestedStrategy: () => void;
  showNewAnalysisTab: () => void;
  showReviseForm: () => void;
  insertStepBefore: (selectedOperation?: string, pageHistory?: string[]) => void;
  insertStepAfter: (selectedOperation?: string, pageHistory?: string[]) => void;
  deleteStep: () => void;
}

export interface StepDetailProps<T extends UiStepTree> extends StepBoxProps<T> {
  isOpen: boolean;
  onClose: () => void;
  allowRevise?: boolean;
}

interface BaseAddType {
  selectedOperation?: string;
  pageHistory?: string[]
}

export interface InsertBefore extends BaseAddType {
  type: 'insert-before';
  /** The output step id of the new step */
  stepId: number;
}

export interface Append extends BaseAddType {
  type: 'append';
  /** The primary input step id of the new step */
  stepId: number;
};

export type AddType = InsertBefore | Append;
