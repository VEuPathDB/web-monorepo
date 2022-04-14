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
      const defaults = variable.distributionDefaults;
      return defaults.displayRangeMin != null &&
        defaults.displayRangeMax != null
        ? {
            min:
              yMinMaxRange != null
                ? Math.min(
                    defaults.displayRangeMin,
                    defaults.rangeMin,
                    yMinMaxRange.min as number
                  )
                : Math.min(defaults.displayRangeMin, defaults.rangeMin),
            max:
              yMinMaxRange != null
                ? Math.max(
                    defaults.displayRangeMax,
                    defaults.rangeMax,
                    yMinMaxRange.max as number
                  )
                : Math.max(defaults.displayRangeMax, defaults.rangeMax),
          }
        : {
            min:
              yMinMaxRange != null
                ? Math.min(defaults.rangeMin, yMinMaxRange.min as number)
                : defaults.rangeMin,
            max:
              yMinMaxRange != null
                ? Math.max(defaults.rangeMax, yMinMaxRange.max as number)
                : defaults.rangeMax,
          };
    } else if (variable.type === 'date') {
      const defaults = variable.distributionDefaults;
      return defaults.displayRangeMin != null &&
        defaults.displayRangeMax != null
        ? {
            min:
              yMinMaxRange != null
                ? [
                    defaults.displayRangeMin,
                    defaults.rangeMin,
                    yMinMaxRange.min as string,
                  ].reduce(function (a, b) {
                    return a < b ? a : b;
                  }) + 'T00:00:00Z'
                : [defaults.displayRangeMin, defaults.rangeMin].reduce(
                    function (a, b) {
                      return a < b ? a : b;
                    }
                  ) + 'T00:00:00Z',
            max:
              yMinMaxRange != null
                ? [
                    defaults.displayRangeMax,
                    defaults.rangeMax,
                    yMinMaxRange.max as string,
                  ].reduce(function (a, b) {
                    return a > b ? a : b;
                  }) + 'T00:00:00Z'
                : [defaults.displayRangeMax, defaults.rangeMax].reduce(
                    function (a, b) {
                      return a > b ? a : b;
                    }
                  ) + 'T00:00:00Z',
          }
        : {
            min:
              yMinMaxRange != null
                ? [defaults.rangeMin, yMinMaxRange.min as string].reduce(
                    function (a, b) {
                      return a < b ? a : b;
                    }
                  ) + 'T00:00:00Z'
                : defaults.rangeMin + 'T00:00:00Z',
            max:
              yMinMaxRange != null
                ? [defaults.rangeMax, yMinMaxRange.max as string].reduce(
                    function (a, b) {
                      return a > b ? a : b;
                    }
                  ) + 'T00:00:00Z'
                : defaults.rangeMax + 'T00:00:00Z',
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
