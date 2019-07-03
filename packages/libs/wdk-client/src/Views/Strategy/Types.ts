import {Step} from 'wdk-client/Utils/WdkUser';
import {RecordClass, QuestionWithParameters} from 'wdk-client/Utils/WdkModel';

export interface UiStepTree {
  color?: string;
  step: Step;
  recordClass: RecordClass;
  primaryInput?: UiStepTree;
  secondaryInput?: UiStepTree;
}

export interface StepBoxesProps {
  stepTree: UiStepTree;
  onShowInsertStep: (stepId: number) => void;
  onHideInsertStep: () => void;
  onExpandNestedStrategy: (stepId: number) => void;
  onCollapseNestedStrategy: (stepId: number) => void;
}

export interface StepBoxProps extends StepBoxesProps {
  nestedId?: number;
  isNested: boolean;
  isExpanded: boolean;
  nestedDisplayName?: string;
}

export interface StepDetailProps extends StepBoxProps {
}