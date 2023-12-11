import { NumberVariable, VariableTreeNode } from '../types/study';

//DKDK add scale in conjunction with
export function variableDisplayWithUnit(
  variable: VariableTreeNode | undefined
): string | undefined {
  if (NumberVariable.is(variable)) {
    if (variable.units && variable.units != null) {
      if (variable.scale && variable.scale != null) {
        return (
          variable.displayName +
          ' (' +
          variable.units +
          ', ' +
          variable.scale +
          ')'
        );
      } else {
        return variable.displayName + ' (' + variable.units + ')';
      }
    } else {
      if (variable.scale && variable.scale != null) {
        return variable.displayName + ' (' + variable.scale + ')';
      } else {
        return variable?.displayName;
      }
    }
  } else return variable?.displayName;
}
