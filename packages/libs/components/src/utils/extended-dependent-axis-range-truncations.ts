import * as DateMath from 'date-arithmetic';
import { NumberOrDate, NumberOrDateRange, NumberRange } from '../types/general';
// Definitions
import { AxisTruncationConfig } from '../types/plots';

/**
 * This can probably be moved to a utils directory when re-used by other plots
 *
 */
export function extendDependentAxisRangeForTruncations(
  axisRange?: NumberOrDateRange,
  config?: AxisTruncationConfig['dependentAxis'],
  valueType?: 'number' | 'date',
  axisRangeControl?: NumberOrDateRange
) {
  //DKDK there is a case dependent config.max and/or min is true due to independent axis control
  // i.e., dependent axis min and/or max is changed
  const dependentAxisUpperExtensionStart = config?.max
    ? axisRangeControl?.max != null
      ? (axisRangeControl?.max as number)
      : (axisRange?.max as number)
    : (axisRange?.max as number);
  const dependentAxisUpperExtensionEnd = config?.max
    ? axisRangeControl?.max != null
      ? (axisRangeControl?.max as number) * 1.05 -
        (axisRangeControl?.min as number) * 0.05
      : (axisRange?.max as number) * 1.05 - (axisRange?.min as number) * 0.05
    : (axisRange?.max as number);
  const dependentAxisLowerExtensionStart = config?.min
    ? axisRangeControl?.min != null
      ? (axisRangeControl?.min as number)
      : (axisRange?.min as number)
    : (axisRange?.min as number);
  const dependentAxisLowerExtensionEnd = config?.min
    ? axisRangeControl?.min != null
      ? (axisRangeControl?.min as number) * 1.05 -
        (axisRangeControl?.max as number) * 0.05
      : (axisRange?.min as number) * 1.05 - (axisRange?.max as number) * 0.05
    : (axisRange?.min as number);

  console.log('axisRange.min, axisRange.max =', axisRange?.min, axisRange?.max);

  console.log(
    'dependentAxisLowerExtensionStart, dependentAxisUpperExtensionStart at function =',
    dependentAxisLowerExtensionStart,
    dependentAxisUpperExtensionStart
  );
  console.log(
    'dependentAxisLowerExtensionEnd, dependentAxisUpperExtensionEnd at function =',
    dependentAxisLowerExtensionEnd,
    dependentAxisUpperExtensionEnd
  );

  return {
    maxStart: dependentAxisUpperExtensionStart,
    max: dependentAxisUpperExtensionEnd,
    minStart: dependentAxisLowerExtensionStart,
    min: dependentAxisLowerExtensionEnd,
  };
}
