import * as DateMath from 'date-arithmetic';
import { NumberOrDate, NumberOrDateRange, NumberRange } from '../types/general';
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
  // axisType?: 'independentAxis' | 'dependentAxis',
  // axisRangeControl?: NumberOrDateRange,
): NumberOrDateRange | undefined {
  //DKDKDK compute truncated axis with 5 % area from the range of min and max
  if (valueType != null && valueType === 'date') {
    //DKDKDK find date diff (days) between range.min and range.max, take 5 % of range, and round up!
    const dateRangeDiff = Math.round(
      DateMath.diff(
        new Date(axisRange?.min as string),
        new Date(axisRange?.max as string),
        'day'
      ) * 0.05
    ); // unit in days

    console.log('dateRangeDiff =', dateRangeDiff);

    const axisLowerExtensionStart = config?.min
      ? DateMath.subtract(
          new Date(axisRange?.min as string),
          dateRangeDiff,
          'day'
        ).toISOString()
      : (axisRange?.min as string);
    const axisUpperExtensionEnd = config?.max
      ? DateMath.add(
          new Date(axisRange?.max as string),
          dateRangeDiff,
          'day'
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
