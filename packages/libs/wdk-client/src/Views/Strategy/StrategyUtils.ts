import { Step } from '../../Utils/WdkUser';

export const BOOLEAN_OPERATOR_PARAM_NAME = 'bq_operator';

export type BooleanOperator = CombineOperator & IgnoreOperator;

export enum CombineOperator {
  Intersect = 'INTERSECT',
  Union = 'UNION',
  LeftMinus = 'MINUS',
  RightMinus = 'RMINUS',
}

export enum IgnoreOperator {
  LeftOnly = 'LONLY',
  RightOnly = 'RONLY',
}

// TODO Consider using the boolean question's vocabulary to drive the operator menus
export const combineOperatorOrder = [
  CombineOperator.Intersect,
  CombineOperator.Union,
  CombineOperator.LeftMinus,
  CombineOperator.RightMinus,
];

export function getStepUrl(step: Step) {
  return `/workspace/strategies/${step.strategyId}/${step.id}`;
}

export function formatDateTimeString(dateTimeString: string) {
  const [date, time] = dateTimeString.split('T');
  const hoursAndMinutes = time.replace(/:[^:]*$/, '');
  return `${date} ${hoursAndMinutes}`;
}

export function makeStepDetailsDisplayName(
  step: Step,
  isCombine: boolean,
  nestedControlStep?: Step
) {
  return (
    (nestedControlStep && nestedControlStep.expandedName) ||
    (nestedControlStep && isCombine && 'Unnamed Nested Strategy') ||
    step.customName
  );
}

export function makeStepBoxDisplayName(
  step: Step,
  isCombine: boolean,
  nestedControlStep?: Step
) {
  return (
    (nestedControlStep && nestedControlStep.expandedName) ||
    (isCombine && 'Unnamed Nested Strategy') ||
    step.customName
  );
}
