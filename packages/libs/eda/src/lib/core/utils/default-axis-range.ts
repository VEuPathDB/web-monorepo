import { Variable } from '../types/study';
import { NumberOrDateRange } from '@veupathdb/components/lib/types/general';
// type of computedVariableMetadata for computation apps such as alphadiv and abundance
import { VariableMapping } from '../api/DataClient/types';
import { min, max } from 'lodash';

export function numberDateDefaultAxisRange(
  variable: Variable | VariableMapping,
  /** the min/minPos/max values observed in the data response */
  observedMin: number | string | undefined,
  observedMinPos: number | string | undefined,
  observedMax: number | string | undefined,
  /** are we using a log scale */
  logScale?: boolean,
  axisRangeSpec = 'Full'
): NumberOrDateRange | undefined {
  if (Variable.is(variable)) {
    if (variable.type === 'number' || variable.type === 'integer') {
      const defaults = variable.distributionDefaults;
      if (logScale && observedMinPos == null) return undefined; // return nothing - there will be no plottable data anyway
      // set default range of Custom to be Auto-zoom
      return axisRangeSpec === 'Full'
        ? {
            min:
              logScale &&
              observedMin != null &&
              (observedMin <= 0 ||
                (defaults.displayRangeMin != null &&
                  defaults.displayRangeMin <= 0) ||
                defaults.rangeMin <= 0)
                ? (observedMinPos as number)
                : // For the min, we want to start at one of the following, in order of precedence:
                  //
                  // - `displayRangeMin`, if it is defined and smaller than `rangeMin`
                  // - `rangeMin`, if it is smaller than `0`
                  // - `0`, otherwise.
                  //
                  // This can be expressed as a `min` function.
                  (min([
                    defaults.displayRangeMin ?? 0,
                    defaults.rangeMin,
                    observedMin as number,
                  ]) as number),
            max: max([
              defaults.displayRangeMax,
              defaults.rangeMax,
              observedMax,
            ]) as number,
          }
        : {
            min: logScale
              ? (observedMinPos as number)
              : (observedMin as number),
            max: observedMax as number,
          };
    } else if (variable.type === 'date') {
      const defaults = variable.distributionDefaults;
      // considering axis range control option such as Full, Auto-zoom, and Custom for date type
      return axisRangeSpec === 'Full'
        ? defaults.displayRangeMin != null && defaults.displayRangeMax != null
          ? {
              min:
                observedMin != null
                  ? [
                      defaults.displayRangeMin,
                      defaults.rangeMin,
                      observedMin as string,
                    ].reduce(function (a, b) {
                      return a < b ? a : b;
                    }) + 'T00:00:00Z'
                  : [defaults.displayRangeMin, defaults.rangeMin].reduce(
                      function (a, b) {
                        return a < b ? a : b;
                      }
                    ) + 'T00:00:00Z',
              max:
                observedMax != null
                  ? [
                      defaults.displayRangeMax,
                      defaults.rangeMax,
                      observedMax as string,
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
                observedMin != null
                  ? [defaults.rangeMin, observedMin as string].reduce(function (
                      a,
                      b
                    ) {
                      return a < b ? a : b;
                    }) + 'T00:00:00Z'
                  : defaults.rangeMin + 'T00:00:00Z',
              max:
                observedMax != null
                  ? [defaults.rangeMax, observedMax as string].reduce(function (
                      a,
                      b
                    ) {
                      return a > b ? a : b;
                    }) + 'T00:00:00Z'
                  : defaults.rangeMax + 'T00:00:00Z',
            }
        : // for the cases of Auto-zoom and Custom options
          {
            min:
              observedMin != null
                ? observedMin + 'T00:00:00Z'
                : defaults.rangeMin + 'T00:00:00Z',
            max:
              observedMax != null
                ? observedMax + 'T00:00:00Z'
                : defaults.rangeMax + 'T00:00:00Z',
          };
    }
    // for the case of computation apps such as alphadiv and abundance
  } else if (
    VariableMapping.is(variable) &&
    variable.displayRangeMin != null &&
    variable.displayRangeMax != null
  ) {
    return axisRangeSpec === 'Full'
      ? {
          min: logScale
            ? (observedMinPos as number)
            : (min([
                // computedVariableMetadata.displayRangeMin/Max are strings
                Number(variable.displayRangeMin),
                Number(observedMin),
              ]) as number),
          max: max([
            Number(variable.displayRangeMax),
            Number(observedMax),
          ]) as number,
        }
      : {
          min: logScale
            ? (observedMinPos as number)
            : (Number(observedMin) as number),
          max: Number(observedMax) as number,
        };
  } else return undefined;
}
