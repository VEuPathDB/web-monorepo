import * as DateMath from 'date-arithmetic';
import { Shape } from 'plotly.js';
import { NumberOrDateRange } from '../types/general';

export type RangeRectGeometry = Pick<
  Partial<Shape>,
  'xref' | 'yref' | 'x0' | 'x1' | 'y0' | 'y1'
>;

/**
 * Where a plotly rect shape highlighting a range of the independent axis
 * goes: across the whole of the other axis. Unless the values are known to
 * be numbers, they are dates, and the rect reaches the end of the max day.
 */
export function rangeToRectGeometry(
  range: NumberOrDateRange,
  orientation: 'vertical' | 'horizontal',
  valueType: 'number' | 'date' | undefined
): RangeRectGeometry {
  const rightCoordinate =
    valueType === 'number'
      ? range.max
      : DateMath.add(new Date(range.max), 0.9999, 'day').toISOString();
  return orientation === 'vertical'
    ? {
        xref: 'x',
        yref: 'paper',
        x0: range.min,
        x1: rightCoordinate,
        y0: 0,
        y1: 1,
      }
    : {
        xref: 'paper',
        yref: 'y',
        x0: 0,
        x1: 1,
        y0: range.min,
        y1: rightCoordinate,
      };
}
