import { Step } from 'wdk-client/Utils/WdkUser';

export const BOOLEAN_OPERATOR_PARAM_NAME = 'bq_operator';

export type BooleanOperator = CombineOperator & IgnoreOperator;

export enum CombineOperator {
  Intersect = 'INTERSECT',
  Union = 'UNION',
  LeftMinus = 'MINUS',
  RightMinus = 'RMINUS'
}

enum IgnoreOperator {
  LeftOnly = 'LONLY',
  RightOnly = 'RONLY'
}

// TODO Consider using the boolean question's vocabulary to drive the operator menus
export const combineOperatorOrder = [
  CombineOperator.Intersect,
  CombineOperator.Union,
  CombineOperator.LeftMinus,
  CombineOperator.RightMinus
];

export function getStepUrl(step: Step) {
  return `/workspace/strategies/${step.strategyId}/${step.id}`;
}

export function formatDateTimeString(dateTimeString: string) {
  const [ date, time ] = dateTimeString.split('T');
  const hoursAndMinutes = time.replace(/:[^:]*$/, '');
  return `${date} ${hoursAndMinutes}`;
}
