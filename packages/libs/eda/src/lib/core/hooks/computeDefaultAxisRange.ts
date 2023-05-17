import { useMemo } from 'react';
import { Variable } from '../types/study';
// for scatter plot
import { numberDateDefaultAxisRange } from '../utils/default-axis-range';
import { NumberOrDateRange } from '../types/general';
// type of computedVariableMetadata for computation apps such as alphadiv and abundance
import { VariableMapping } from '../api/DataClient/types';
import { numberSignificantFigures } from '../utils/number-significant-figures';
import { DateTime } from 'luxon';

/**
 * A custom hook to compute default axis range from annotated and observed min/max values
 * taking into account log scale, dates and computed variables
 */

export function useDefaultAxisRange(
  /** the variable (or computed variable) or null/undefined if no variable (e.g. histogram/barplot y) */
  variable: Variable | VariableMapping | undefined | null,
  /** the min/minPos/max values observed in the data response */
  min?: number | string,
  minPos?: number | string,
  max?: number | string,
  /** are we using a log scale */
  logScale?: boolean,
  axisRangeSpec = 'Full',
  filterRange?: {
    min: string | number;
    max: string | number;
  }
): NumberOrDateRange | undefined {
  const defaultAxisRange = useMemo(() => {
    // Check here to make sure number ranges (min, minPos, max) came with number variables
    // Originally from https://github.com/VEuPathDB/web-eda/pull/1004
    // Only checking min for brevity.
    // use luxon library to check the validity of date string
    if (
      (Variable.is(variable) &&
        (min == null ||
          ((variable.type === 'number' || variable.type === 'integer') &&
            typeof min === 'number') ||
          (variable.type === 'date' &&
            typeof min === 'string' &&
            isValidDateString(min)))) ||
      VariableMapping.is(variable)
    ) {
      const defaultRange = numberDateDefaultAxisRange(
        variable,
        min,
        minPos,
        max,
        logScale,
        axisRangeSpec,
        filterRange
      );

      // 4 significant figures
      if (
        // consider computed variable as well
        (Variable.is(variable) &&
          (variable.type === 'number' || variable.type === 'integer') &&
          typeof defaultRange?.min === 'number' &&
          typeof defaultRange?.max === 'number') ||
        (VariableMapping.is(variable) &&
          typeof defaultRange?.min === 'number' &&
          typeof defaultRange?.max === 'number')
      )
        // check non-zero baseline for continuous overlay variable
        return {
          min: numberSignificantFigures(defaultRange.min, 4, 'down'),
          max: numberSignificantFigures(defaultRange.max, 4, 'up'),
        };
      else return defaultRange;
    } else if (
      variable == null &&
      typeof max === 'number' &&
      typeof minPos === 'number'
    ) {
      // if there's no variable, it's a count or proportion axis (barplot/histogram)
      return logScale
        ? {
            min: numberSignificantFigures(
              Math.min(minPos / 10, 0.1),
              4,
              'down'
            ), // ensure the minimum-height bars will be visible
            max: numberSignificantFigures(max, 4, 'up'),
          }
        : {
            min: 0,
            max: numberSignificantFigures(max, 4, 'up'),
          };
    } else {
      return undefined;
    }
  }, [variable, min, minPos, max, logScale, axisRangeSpec]);
  return defaultAxisRange;
}

function isValidDateString(value: string) {
  return DateTime.fromISO(value).isValid;
}
