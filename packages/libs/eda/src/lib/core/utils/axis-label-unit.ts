import { Variable } from '../types/study';

export function axisLabelWithUnit(
  axisVariableContent: Variable | undefined
): string | undefined {
  if (
    axisVariableContent?.type === 'number' &&
    axisVariableContent.units &&
    axisVariableContent.units != null
  )
    return (
      axisVariableContent.displayName + ' (' + axisVariableContent.units + ')'
    );
  else return axisVariableContent?.displayName;
}
