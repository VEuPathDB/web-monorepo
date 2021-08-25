import * as DateMath from 'date-arithmetic';
import { NumberOrDate, NumberOrDateRange, NumberRange } from '../types/general';
// Definitions
import { AxisTruncationConfig } from '../types/plots';

/**
 * This can probably be moved to a utils directory when re-used by other plots
 *
 */
export function extendIndependentAxisRangeForTruncations(
  axisRange?: NumberOrDateRange,
  config?: AxisTruncationConfig['independentAxis'],
  valueType: 'number' | 'date' = 'number',
  axisRangeControl?: NumberOrDateRange
): NumberOrDateRange | undefined {
  //DKDK compute truncated axis with 5 % area from the range of min and max
  if (valueType != null && valueType === 'date') {
    //DKDK find date diff (days) between range.min and range.max, take 5 % of range, and round up!
    const dateRangeDiff = Math.round(
      DateMath.diff(
        new Date(axisRange?.min as string),
        new Date(axisRange?.max as string),
        'day'
      ) * 0.05
    ); // unit in days

    console.log('dateRangeDiff =', dateRangeDiff);

    const independentAxisLowerExtensionStart = config?.min
      ? DateMath.subtract(
          new Date(axisRange?.min as string),
          dateRangeDiff,
          'day'
        ).toISOString()
      : (axisRange?.min as string);
    // independentAxisLowerExtensionEnd = axisRange?.min as string;
    // independentAxisUpperExtensionStart = config?.max
    //   ? (axisRange?.max as string)
    //   : rightCoordinate;
    const independentAxisUpperExtensionEnd = config?.max
      ? DateMath.add(
          new Date(axisRange?.max as string),
          dateRangeDiff,
          'day'
        ).toISOString()
      : (axisRange?.max as string);

    return {
      min: independentAxisLowerExtensionStart,
      max: independentAxisUpperExtensionEnd,
    };
  } else {
    const independentAxisLowerExtensionStart = config?.min
      ? (axisRange?.min as number) -
        ((axisRange?.max as number) - (axisRange?.min as number)) * 0.05
      : (axisRange?.min as number);
    // independentAxisLowerExtensionEnd = axisRange?.min as number;
    // independentAxisUpperExtensionStart = config?.max
    //   ? (axisRange?.max as number)
    //   : (defaultIndependentAxisRange?.max as number);
    const independentAxisUpperExtensionEnd = config?.max
      ? (axisRange?.max as number) +
        ((axisRange?.max as number) - (axisRange?.min as number)) * 0.05
      : (axisRange?.max as number);

    return {
      min: independentAxisLowerExtensionStart,
      max: independentAxisUpperExtensionEnd,
    };
  }
}
