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
  // set plot type to adjust padding/margin
  // histogram: no padding for X and Y; barplot: no min padding for Y
  plotType?: string,
  logScale?: boolean
): NumberOrDateRange | undefined {
  // set this to avoid error
  if (axisRange == null) return undefined;

  // adjust margin per log scale
  const noTruncationMargin = logScale ? 0.3 : 0.02;

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
        config?.min
          ? dateRangeDiff
          : plotType === 'histogram'
          ? // no padding/margin
            0
          : dateRangeDiffNoTruncation,
        'hours'
      ).toISOString();

      // consider padding
      const axisUpperExtensionEnd = DateMath.add(
        new Date(axisRange.max as string),
        // padding: check truncation or not
        config?.max
          ? dateRangeDiff
          : plotType === 'histogram'
          ? // no padding/margin
            0
          : dateRangeDiffNoTruncation,
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
        plotType === 'histogram' || plotType === 'barplot'
        ? (axisRange.min as number)
        : (axisRange.min as number) - 0.02 * diff;
      const axisUpperExtensionEnd = config?.max
        ? (axisRange.max as number) + 0.05 * diff
        : // set exceptions: no need to have max padding for histogram
        plotType === 'histogram'
        ? (axisRange.max as number)
        : (axisRange.max as number) + noTruncationMargin * diff;

      return {
        min: axisLowerExtensionStart,
        max: axisUpperExtensionEnd,
      };
    }
  } else return undefined;
}
