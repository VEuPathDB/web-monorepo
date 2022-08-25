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
  addPadding: boolean = false,
  logScale: boolean = false
): NumberOrDateRange | undefined {
  // set this to avoid error
  if (axisRange == null) return undefined;

  const truncationMarginFactor = 0.05; // how much padding needed for the yellow truncation warning
  const noTruncationMarginFactor = 0.02; // how much padding needed for, e.g. scatter plot points, even when not truncated

  // compute truncated axis with 5 % area from the range of min and max
  if (valueType != null) {
    if (valueType === 'date') {
      // find date diff (days) between range.min and range.max, take 5 % of range, and round up!
      const dateRangeDiff = Math.round(
        DateMath.diff(
          new Date(axisRange?.min as string),
          new Date(axisRange?.max as string),
          'hours'
        ) * truncationMarginFactor
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
          : addPadding
          ? dateRangeDiffNoTruncation
          : 0,
        'hours'
      ).toISOString();

      // consider padding
      const axisUpperExtensionEnd = DateMath.add(
        new Date(axisRange.max as string),
        // padding: check truncation or not
        config?.max
          ? dateRangeDiff
          : addPadding
          ? dateRangeDiffNoTruncation
          : 0,
        'hours'
      ).toISOString();

      return {
        min: axisLowerExtensionStart,
        max: axisUpperExtensionEnd,
      };
    } else {
      // consider padding
      const diff = (axisRange.max as number) - (axisRange.min as number);
      const ratio = (axisRange.max as number) / (axisRange.min as number);
      const axisLowerExtensionStart = config?.min
        ? logScale && isFinite(ratio) && ratio > 0
          ? (axisRange.min as number) /
            10 ** (truncationMarginFactor * Math.log10(ratio))
          : (axisRange.min as number) - truncationMarginFactor * diff
        : !addPadding
        ? (axisRange.min as number)
        : logScale && isFinite(ratio) && ratio > 0
        ? (axisRange.min as number) /
          10 ** (noTruncationMarginFactor * Math.log10(ratio))
        : (axisRange.min as number) - noTruncationMarginFactor * diff;
      const axisUpperExtensionEnd = config?.max
        ? logScale && isFinite(ratio) && ratio > 0
          ? (axisRange.max as number) *
            10 ** (truncationMarginFactor * Math.log10(ratio))
          : (axisRange.max as number) + truncationMarginFactor * diff
        : !addPadding
        ? (axisRange.max as number)
        : logScale && isFinite(ratio) && ratio > 0
        ? (axisRange.max as number) *
          10 ** (noTruncationMarginFactor * Math.log10(ratio))
        : (axisRange.max as number) + noTruncationMarginFactor * diff;

      return {
        min: axisLowerExtensionStart,
        max: axisUpperExtensionEnd,
      };
    }
  } else return undefined;
}
