import { NumberVariable, VariableTreeNode } from '../types/study';

// add scale in conjunction with units
export function variableDisplayWithUnit(
  variable: VariableTreeNode | undefined
): string | undefined {
  if (variable == null) return;

  if (!NumberVariable.is(variable)) return variable.displayName;

  const parentheticalParts = [variable.units, variable.scale].filter(Boolean);

  if (parentheticalParts.length)
    return `${variable.displayName} (${parentheticalParts.join(', ')})`;

  return variable.displayName;
}
