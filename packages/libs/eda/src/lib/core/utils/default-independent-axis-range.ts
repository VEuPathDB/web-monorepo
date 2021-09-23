import { Variable } from '../types/study';
import { NumberOrDateRange } from '@veupathdb/components/lib/types/general';

export function defaultIndependentAxisRange(
  variable: Variable | undefined,
  plotName: string
): NumberOrDateRange | undefined {
  // make universal range variable
  if (variable != null && variable.dataShape === 'continuous') {
    if (variable.type === 'number') {
      return variable.displayRangeMin != null &&
        variable.displayRangeMax != null
        ? {
            min: Math.min(variable.displayRangeMin, variable.rangeMin),
            max: Math.max(variable.displayRangeMax, variable.rangeMax),
          }
        : {
            // separate histogram following the criterion at histogram filter
            min:
              plotName === 'histogram'
                ? Math.min(0, variable.rangeMin)
                : variable.rangeMin,
            max: variable.rangeMax,
          };
    } else if (variable.type === 'date') {
      return variable.displayRangeMin != null &&
        variable.displayRangeMax != null
        ? {
            min:
              [variable.displayRangeMin, variable.rangeMin].reduce(function (
                a,
                b
              ) {
                return a < b ? a : b;
              }) + 'T00:00:00Z',
            max:
              [variable.displayRangeMax, variable.rangeMax].reduce(function (
                a,
                b
              ) {
                return a > b ? a : b;
              }) + 'T00:00:00Z',
          }
        : {
            min: variable.rangeMin + 'T00:00:00Z',
            max: variable.rangeMax + 'T00:00:00Z',
          };
    }
  } else return undefined;
}
