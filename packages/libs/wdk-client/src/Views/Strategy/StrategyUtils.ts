import { Step } from 'wdk-client/Utils/WdkUser';

export function getStepUrl(step: Step) {
  return `/workspace/strategies/${step.strategyId}/${step.id}`;
}