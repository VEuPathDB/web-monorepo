import * as DateMath from 'date-arithmetic';
import { NumberOrDateRange } from '../types/general';
// Definitions
import { AxisTruncationConfig } from '../types/plots';

/**
 * This can probably be moved to a utils directory when re-used by other plots
 *
 */
export function extendAxisRangeForTruncations(
  axisRange?: NumberOrDateRange,
  config?: AxisTruncationConfig['independentAxis' | 'dependentAxis'],
  valueType: 'number' | 'date' = 'number'
): NumberOrDateRange | undefined {
  // compute truncated axis with 5 % area from the range of min and max
  if (valueType != null && valueType === 'date') {
    // find date diff (days) between range.min and range.max, take 5 % of range, and round up!
    const dateRangeDiff = Math.round(
      DateMath.diff(
        new Date(axisRange?.min as string),
        new Date(axisRange?.max as string),
        'hours'
      ) * 0.05
    ); // unit in hours

    const axisLowerExtensionStart = config?.min
      ? DateMath.subtract(
          new Date(axisRange?.min as string),
          dateRangeDiff,
          'hours'
        ).toISOString()
      : (axisRange?.min as string);
    const axisUpperExtensionEnd = config?.max
      ? DateMath.add(
          new Date(axisRange?.max as string),
          dateRangeDiff,
          'hours'
        ).toISOString()
      : (axisRange?.max as string);

    return {
      min: axisLowerExtensionStart,
      max: axisUpperExtensionEnd,
    };
  } else {
    const axisLowerExtensionStart = config?.min
      ? (axisRange?.min as number) * 1.05 - (axisRange?.max as number) * 0.05
      : (axisRange?.min as number);
    const axisUpperExtensionEnd = config?.max
      ? (axisRange?.max as number) * 1.05 - (axisRange?.min as number) * 0.05
      : (axisRange?.max as number);

    return {
      min: axisLowerExtensionStart,
      max: axisUpperExtensionEnd,
    };
  }
}
