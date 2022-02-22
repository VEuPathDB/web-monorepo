import { NumberVariable, VariableTreeNode } from '../types/study';

export function variableDisplayWithUnit(
  variable: VariableTreeNode | undefined
): string | undefined {
  if (NumberVariable.is(variable) && variable.units && variable.units != null)
    return variable.displayName + ' (' + variable.units + ')';
  else return variable?.displayName;
}
