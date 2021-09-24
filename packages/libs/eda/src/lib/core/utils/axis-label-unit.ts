import { NumberVariable, VariableTreeNode } from '../types/study';

export function axisLabelWithUnit(
  axisVariableContent: VariableTreeNode | undefined
): string | undefined {
  if (
    NumberVariable.is(axisVariableContent) &&
    axisVariableContent.units &&
    axisVariableContent.units != null
  )
    return (
      axisVariableContent.displayName + ' (' + axisVariableContent.units + ')'
    );
  else return axisVariableContent?.displayName;
}
