import { Variable } from '../types/study';
import { NumberOrDateRange } from '@veupathdb/components/lib/types/general';

export function defaultDependentAxisRange(
  variable: Variable | undefined,
  plotName: string,
  yMinMaxRange:
    | { min: number | string | undefined; max: number | string | undefined }
    | undefined
): NumberOrDateRange | undefined {
  // make universal range variable
  if (variable != null && plotName === 'scatterplot') {
    // this should check integer as well
    if (variable.type === 'number' || variable.type === 'integer') {
      return variable.displayRangeMin != null &&
        variable.displayRangeMax != null
        ? {
            min:
              yMinMaxRange != null
                ? Math.min(
                    variable.displayRangeMin,
                    variable.rangeMin,
                    yMinMaxRange.min as number
                  )
                : Math.min(variable.displayRangeMin, variable.rangeMin),
            max:
              yMinMaxRange != null
                ? Math.max(
                    variable.displayRangeMax,
                    variable.rangeMax,
                    yMinMaxRange.max as number
                  )
                : Math.max(variable.displayRangeMax, variable.rangeMax),
          }
        : {
            min:
              yMinMaxRange != null
                ? Math.min(variable.rangeMin, yMinMaxRange.min as number)
                : variable.rangeMin,
            max:
              yMinMaxRange != null
                ? Math.min(variable.rangeMax, yMinMaxRange.max as number)
                : variable.rangeMax,
          };
    } else if (variable.type === 'date') {
      return variable.displayRangeMin != null &&
        variable.displayRangeMax != null
        ? {
            min:
              yMinMaxRange != null
                ? [
                    variable.displayRangeMin,
                    variable.rangeMin,
                    yMinMaxRange.min as string,
                  ].reduce(function (a, b) {
                    return a < b ? a : b;
                  }) + 'T00:00:00Z'
                : [variable.displayRangeMin, variable.rangeMin].reduce(
                    function (a, b) {
                      return a < b ? a : b;
                    }
                  ) + 'T00:00:00Z',
            max:
              yMinMaxRange != null
                ? [
                    variable.displayRangeMax,
                    variable.rangeMax,
                    yMinMaxRange.max as string,
                  ].reduce(function (a, b) {
                    return a > b ? a : b;
                  }) + 'T00:00:00Z'
                : [variable.displayRangeMax, variable.rangeMax].reduce(
                    function (a, b) {
                      return a > b ? a : b;
                    }
                  ) + 'T00:00:00Z',
          }
        : {
            min:
              yMinMaxRange != null
                ? [variable.rangeMin, yMinMaxRange.min as string].reduce(
                    function (a, b) {
                      return a < b ? a : b;
                    }
                  ) + 'T00:00:00Z'
                : variable.rangeMin + 'T00:00:00Z',
            max:
              yMinMaxRange != null
                ? [variable.rangeMax, yMinMaxRange.max as string].reduce(
                    function (a, b) {
                      return a > b ? a : b;
                    }
                  ) + 'T00:00:00Z'
                : variable.rangeMax + 'T00:00:00Z',
          };
    }
  } else return undefined;
}
