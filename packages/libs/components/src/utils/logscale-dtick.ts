import { NumberOrDateRange } from '../types/general';
import { isNumber } from '../types/guards';

/**
 * Given an axis range, this will usually a value of 1 to be used in Plotly's layout.{x,y}axis.dtick,
 * which indicates 10-fold tickmark spacing (it's calculated as 10**dtick)
 *
 * However, if the ratio between range.max/range.min is less than 10, we need to use a smaller spacing
 * so that we get some tick marks.
 *
 */
export function logScaleDtick(range: NumberOrDateRange | undefined): number {
  if (
    range != null &&
    range.min > 0 &&
    isNumber(range.max) &&
    isNumber(range.min)
  ) {
    const ratio = range.max / range.min;
    if (ratio < 10) {
      if (ratio >= 2) return Math.log10(2);
      // for extreme low-range cases like body temperature
      // unfortunately does not give integer tick marks
      return Math.log10(1.1);
    }
  }
  return 1;
}
