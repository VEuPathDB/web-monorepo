import {Step} from 'wdk-client/Utils/WdkUser';
import {RecordClass} from 'wdk-client/Utils/WdkModel';

export interface UiStepTree {
  color?: string;
  step: Step;
  recordClass: RecordClass;
  primaryInput?: UiStepTree;
  secondaryInput?: UiStepTree;
}
