import { RecordClass, Question } from 'wdk-client/Utils/WdkModel';
import { Step } from 'wdk-client/Utils/WdkUser';

export interface UiStepTree {
  color?: string;
  step: Step;
  recordClass: RecordClass;
  question: Question;
  primaryInput?: UiStepTree;
  secondaryInput?: UiStepTree;
  nestedControlStep?: Step;
  isNested: boolean;
}

// specialized UiStepTree types and guards

export interface LeafUiStepTree extends UiStepTree {
  primaryInput: undefined;
  secondaryInput: undefined;
}

export function isLeafUiStepTree(stepTree: UiStepTree): stepTree is LeafUiStepTree {
  return stepTree.primaryInput == null && stepTree.secondaryInput == null;
}

export interface TransformUiStepTree extends UiStepTree {
  primaryInput: UiStepTree;
  secondaryInput: undefined;
}

export function isTransformUiStepTree(stepTree: UiStepTree): stepTree is TransformUiStepTree {
  return stepTree.primaryInput != null && stepTree.secondaryInput == null;
}

export interface CombineUiStepTree extends UiStepTree {
  primaryInput: UiStepTree;
  secondaryInput: UiStepTree;
}

export function isCombineUiStepTree(stepTree: UiStepTree): stepTree is CombineUiStepTree {
  return stepTree.primaryInput != null && stepTree.secondaryInput != null;
}

export interface StepBoxesProps {
  stepTree: UiStepTree;
  nestedStrategyBranchToRename?: number;
  isDeleteable?: boolean;
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

export interface StepBoxProps {
  stepTree: UiStepTree;
  isNested: boolean;
  isExpanded: boolean;
  isDeleteable: boolean;
  renameStep: (newName: string) => void;
  makeNestedStrategy: () => void;
  makeUnnestStrategy: () => void;
  collapseNestedStrategy: () => void;
  expandNestedStrategy: () => void;
  showNewAnalysisTab: () => void;
  showReviseForm: () => void;
  insertStepBefore: () => void;
  deleteStep: () => void;
}

export interface StepDetailProps extends StepBoxProps {
  isOpen: boolean;
  onClose: () => void;
  allowRevise?: boolean;
}

export interface InsertBefore {
  type: 'insert-before';
  /** The output step id of the new step */
  stepId: number;
}

export interface Append {
  type: 'append';
  /** The primary input step id of the new step */
  stepId: number;
};

export type AddType = InsertBefore | Append;
