import { NumberDistributionDefaults, Variable } from '../types/study';
import { NumberOrDateRange } from '@veupathdb/components/lib/types/general';
// type of computedVariableMetadata for computation apps such as alphadiv and abundance
import { VariableMapping } from '../api/DataClient/types';
import { MAX_DISTRIBUTION_BINS } from '../constants';
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
      // set default range of Custom to be Auto-zoom and check Histogram Viz
      return axisRangeSpec === 'Full'
        ? {
            min:
              logScale &&
              observedMin != null &&
              ((observedMin as number) <= 0 ||
                (defaults.displayRangeMin != null &&
                  defaults.displayRangeMin <= 0) ||
                defaults.rangeMin <= 0)
                ? (observedMinPos as number)
                : getSafeLowerBound(defaults, observedMin as number),
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

/**
 * The basic functionality is to return `min([ displayRangeMin ?? 0, rangeMin, observedMin ])`
 * The zero is targeted at histograms which should start at zero even if rangeMin > 0.
 *
 * However, there is an edge case for variables whose values are clustered far from zero
 * (e.g. a year-like integer with values 2000..2004 and a default `binWidth` of 1).
 * If we are making a `distribution` histogram request in this scenario, we do NOT want
 * to anchor the lower bound at zero and request `{ min: 0, max: rangeMax, binWidth: 1 }`
 * because the bin count (`rangeMax / binWidth`) would exceed the backend's limit and
 * produce a "Maximum number of allowed bins exceeded" error.
 *
 * The solution is to detect when anchoring at zero would create an excessive number of
 * bins and instead use `rangeMin - binWidth` for the lower bound.
 */
function getSafeLowerBound(
  { displayRangeMin, rangeMin, rangeMax, binWidth }: NumberDistributionDefaults,
  observedMin?: number
): number {
  let lowerBound = 0; // for "full" ranges for non-edge-case positive variables

  // If there's a human-supplied minimum, trust it
  if (displayRangeMin != null) {
    lowerBound = displayRangeMin;
  } else if (
    // would anchoring the lower bound at zero create too many bins?
    rangeMax / (binWidth ?? 1) >
    MAX_DISTRIBUTION_BINS
  ) {
    lowerBound = rangeMin - (binWidth ?? 1);
  }

  return min([lowerBound, rangeMin, observedMin]) as number;
}
