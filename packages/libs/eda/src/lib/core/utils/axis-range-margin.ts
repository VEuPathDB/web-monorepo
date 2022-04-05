import * as DateMath from 'date-arithmetic';
import { NumberOrDateRange } from '@veupathdb/components/lib/types/general';
// util to get specific decimal points as a number, not string
import { numberDecimalPoint } from '../utils/number-decimal-point';

export function axisRangeMargin(
  axisRange?: NumberOrDateRange | undefined,
  valueType?: string | undefined
): NumberOrDateRange | undefined {
  // ensure axisRange is not undefined
  if (axisRange == null) return undefined;

  // compute truncated axis with 5 % area from the range of min and max
  if (valueType != null) {
    if (valueType === 'date') {
      // find date diff (days) between range.min and range.max, take 5 % of range, and round up!
      const dateRangeDiff = Math.round(
        DateMath.diff(
          new Date(axisRange.min as string),
          new Date(axisRange.max as string),
          'day'
        ) * 0.05
      ); // unit in days
      const axisLowerExtensionStart = DateMath.subtract(
        new Date(axisRange.min as string),
        dateRangeDiff,
        'day'
      ).toISOString();
      const axisUpperExtensionEnd = DateMath.add(
        new Date(axisRange.max as string),
        dateRangeDiff,
        'day'
      ).toISOString();

      return {
        min: axisLowerExtensionStart,
        max: axisUpperExtensionEnd,
      };
    } else {
      const diff = (axisRange.max as number) - (axisRange.min as number);
      const axisLowerExtensionStart = (axisRange.min as number) - 0.05 * diff;
      const axisUpperExtensionEnd = (axisRange.max as number) + 0.05 * diff;
      return {
        min: numberDecimalPoint(axisLowerExtensionStart, 4),
        max: numberDecimalPoint(axisUpperExtensionEnd, 4),
      };
    }
  } else return undefined;
}
