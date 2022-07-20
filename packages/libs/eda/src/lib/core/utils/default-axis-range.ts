import { Variable } from '../types/study';
import { NumberOrDateRange } from '@veupathdb/components/lib/types/general';
// type of computedVariableMetadata for computation apps such as alphadiv and abundance
import { ComputedVariableMetadata } from '../api/DataClient/types';
import { min, max } from 'lodash';

export function numberDateDefaultAxisRange(
  variable: Variable | ComputedVariableMetadata,
  /** the min/minPos/max values observed in the data response */
  observedMin: number | string | undefined,
  observedMinPos: number | string | undefined,
  observedMax: number | string | undefined,
  /** are we using a log scale */
  logScale?: boolean
): NumberOrDateRange | undefined {
  if (Variable.is(variable)) {
    if (variable.type === 'number' || variable.type === 'integer') {
      const defaults = variable.distributionDefaults;
      return defaults.displayRangeMin != null &&
        defaults.displayRangeMax != null
        ? {
            min:
              logScale &&
              observedMin != null &&
              (observedMin <= 0 ||
                defaults.displayRangeMin <= 0 ||
                defaults.rangeMin <= 0)
                ? (observedMinPos as number)
                : observedMin != null
                ? Math.min(
                    defaults.displayRangeMin,
                    defaults.rangeMin,
                    observedMin as number
                  )
                : Math.min(defaults.displayRangeMin, defaults.rangeMin),
            max:
              observedMax != null
                ? Math.max(
                    defaults.displayRangeMax,
                    defaults.rangeMax,
                    observedMax as number
                  )
                : Math.max(defaults.displayRangeMax, defaults.rangeMax),
          }
        : {
            min: logScale
              ? (observedMinPos as number)
              : observedMin != null
              ? Math.min(defaults.rangeMin, observedMin as number)
              : defaults.rangeMin,
            max:
              observedMax != null
                ? Math.max(defaults.rangeMax, observedMax as number)
                : defaults.rangeMax,
          };
    } else if (variable.type === 'date') {
      const defaults = variable.distributionDefaults;
      return defaults.displayRangeMin != null &&
        defaults.displayRangeMax != null
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
          };
    }
    // for the case of computation apps such as alphadiv and abundance
  } else if (
    ComputedVariableMetadata.is(variable) &&
    variable.displayRangeMin != null &&
    variable.displayRangeMax != null
  ) {
    // TO DO: checked for plotName=='scatterplot' previously - do we need to do this still?
    return {
      min: min([
        // computedVariableMetadata.displayRangeMin/Max are strings
        Number(variable.displayRangeMin),
        Number(observedMin),
      ]) as number,
      max: max([
        Number(variable.displayRangeMax),
        Number(observedMax),
      ]) as number,
    };
  } else return undefined;
}
