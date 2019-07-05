import { RecordClass } from 'wdk-client/Utils/WdkModel';
import { Step } from 'wdk-client/Utils/WdkUser';

export interface UiStepTree {
  color?: string;
  step: Step;
  recordClass: RecordClass;
  primaryInput?: UiStepTree;
  secondaryInput?: UiStepTree;
  nestedControlStep?: Step;
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
  onShowInsertStep: (stepId: number) => void;
  onHideInsertStep: () => void;
  onExpandNestedStrategy: (stepId: number) => void;
  onCollapseNestedStrategy: (stepId: number) => void;
}

export interface StepBoxProps extends StepBoxesProps {
  isNested: boolean;
}

export interface StepDetailProps extends StepBoxProps {
}