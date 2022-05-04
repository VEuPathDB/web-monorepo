import { useMemo } from 'react';
import { DateVariable, NumberVariable, Variable } from '../types/study';
import { NumberOrDateRange } from '@veupathdb/components/lib/types/general';
// utililty function to get specific decimal points as a number, not string
import { numberDecimalPoint } from '../utils/number-decimal-point';

export function defaultIndependentAxisRangeFunction(
  variable: Variable | undefined,
  plotName: string
): NumberOrDateRange | undefined {
  // make universal range variable
  if (variable != null) {
    if (NumberVariable.is(variable)) {
      const defaults = variable.distributionDefaults;
      return defaults.displayRangeMin != null &&
        defaults.displayRangeMax != null
        ? {
            min: numberDecimalPoint(
              Math.min(defaults.displayRangeMin, defaults.rangeMin),
              4
            ),
            max: numberDecimalPoint(
              Math.max(defaults.displayRangeMax, defaults.rangeMax),
              4
            ),
          }
        : {
            // separate histogram following the criterion at histogram filter
            min:
              plotName === 'histogram'
                ? numberDecimalPoint(Math.min(0, defaults.rangeMin), 4)
                : numberDecimalPoint(defaults.rangeMin, 4),
            max: numberDecimalPoint(defaults.rangeMax, 4),
          };
    } else if (DateVariable.is(variable)) {
      const defaults = variable.distributionDefaults;
      return defaults.displayRangeMin != null &&
        defaults.displayRangeMax != null
        ? {
            min:
              [defaults.displayRangeMin, defaults.rangeMin].reduce(function (
                a,
                b
              ) {
                return a < b ? a : b;
              }) + 'T00:00:00Z',
            max:
              [defaults.displayRangeMax, defaults.rangeMax].reduce(function (
                a,
                b
              ) {
                return a > b ? a : b;
              }) + 'T00:00:00Z',
          }
        : {
            min: defaults.rangeMin + 'T00:00:00Z',
            max: defaults.rangeMax + 'T00:00:00Z',
          };
    }
  } else return undefined;
}

export function useDefaultIndependentAxisRange(
  variable: Variable | undefined,
  plotName: string
): NumberOrDateRange | undefined {
  // consider both histogram and scatterplot at once
  const defaultIndependentAxisRange:
    | NumberOrDateRange
    | undefined = useMemo(() => {
    const defaultIndependentRange = defaultIndependentAxisRangeFunction(
      variable,
      plotName
    );
    return defaultIndependentRange;
  }, [variable, plotName]);

  return defaultIndependentAxisRange;
}
