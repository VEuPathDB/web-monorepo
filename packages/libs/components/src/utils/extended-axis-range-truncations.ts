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
  valueType?: 'number' | 'date',
  // set no minimum padding for histogram & barplot (boxplot?)
  noMinPadding?: boolean
): NumberOrDateRange | undefined {
  // set this to avoid error
  if (axisRange == null) return undefined;

  // compute truncated axis with 5 % area from the range of min and max
  if (valueType != null) {
    if (valueType === 'date') {
      // find date diff (days) between range.min and range.max, take 5 % of range, and round up!
      const dateRangeDiff = Math.round(
        DateMath.diff(
          new Date(axisRange?.min as string),
          new Date(axisRange?.max as string),
          'hours'
        ) * 0.05
      ); // unit in hours

      // padding: used for no truncation
      const dateRangeDiffNoTruncation = Math.round(
        DateMath.diff(
          new Date(axisRange.min as string),
          new Date(axisRange.max as string),
          'hours'
        ) * 0.02
      ); // unit in hours

      const axisLowerExtensionStart = DateMath.subtract(
        new Date(axisRange.min as string),
        // padding: check truncation or not
        config?.min ? dateRangeDiff : dateRangeDiffNoTruncation,
        'hours'
      ).toISOString();

      // consider padding
      const axisUpperExtensionEnd = DateMath.add(
        new Date(axisRange.max as string),
        // padding: check truncation or not
        config?.max ? dateRangeDiff : dateRangeDiffNoTruncation,
        'hours'
      ).toISOString();

      return {
        min: axisLowerExtensionStart,
        max: axisUpperExtensionEnd,
      };
    } else {
      // consider padding
      const diff = (axisRange.max as number) - (axisRange.min as number);
      const axisLowerExtensionStart = config?.min
        ? (axisRange.min as number) - 0.05 * diff
        : // set exceptions: no need to have min padding for histogram & barplot (boxplot?)
        noMinPadding
        ? (axisRange.min as number)
        : (axisRange.min as number) - 0.02 * diff;
      const axisUpperExtensionEnd = config?.max
        ? (axisRange.max as number) + 0.05 * diff
        : (axisRange.max as number) + 0.02 * diff;

      return {
        min: axisLowerExtensionStart,
        max: axisUpperExtensionEnd,
      };
    }
  } else return undefined;
}
