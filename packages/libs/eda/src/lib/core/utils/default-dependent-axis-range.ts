import { Variable } from '../types/study';
import { NumberOrDateRange } from '@veupathdb/components/lib/types/general';
// type of computedVariableMetadata for computation apps such as alphadiv and abundance
import { ComputedVariableMetadata } from '../api/DataClient/types';
import { min, max } from 'lodash';

export function numberDateDefaultDependentAxisRange(
  variable: Variable | undefined,
  plotName: string,
  yMinMaxRange:
    | { min: number | string | undefined; max: number | string | undefined }
    | undefined,
  // pass computedVariableMetadata
  computedVariableMetadata?: ComputedVariableMetadata
): NumberOrDateRange | undefined {
  // make universal range variable
  if (
    variable != null &&
    (plotName === 'scatterplot' || plotName === 'lineplot')
  ) {
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
                ? Math.max(variable.rangeMax, yMinMaxRange.max as number)
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
    // for the case of computation apps such as alphadiv and abundance
  } else if (computedVariableMetadata != null && plotName === 'scatterplot') {
    return {
      min: min([
        // computedVariableMetadata.displayRangeMin/Max are strings
        Number(computedVariableMetadata.displayRangeMin),
        yMinMaxRange?.min as number,
      ]) as number,
      max: max([
        Number(computedVariableMetadata.displayRangeMax),
        yMinMaxRange?.max as number,
      ]) as number,
    };
  } else return undefined;
}
