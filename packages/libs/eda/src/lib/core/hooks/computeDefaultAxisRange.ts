import { useMemo } from 'react';
import { Variable } from '../types/study';
// for scatter plot
import { numberDateDefaultAxisRange } from '../utils/default-axis-range';
import { NumberOrDateRange } from '../types/general';
// type of computedVariableMetadata for computation apps such as alphadiv and abundance
import { ComputedVariableMetadata } from '../api/DataClient/types';
import {
  numberSignificantFiguresRoundUp,
  numberSignificantFiguresRoundDown,
} from '../utils/number-significant-figures';

/**
 * A custom hook to compute default axis range from annotated and observed min/max values
 * taking into account log scale, dates and computed variables
 */

export function useDefaultAxisRange(
  /** the variable (or computed variable) or null/undefined if no variable (e.g. histogram/barplot y) */
  variable: Variable | ComputedVariableMetadata | undefined | null,
  /** the min/minPos/max values observed in the data response */
  min?: number | string,
  minPos?: number | string,
  max?: number | string,
  /** are we using a log scale */
  logScale?: boolean
): NumberOrDateRange | undefined {
  const defaultAxisRange = useMemo(() => {
    // Check here to make sure number ranges (min, minPos, max) came with number variables
    // (and date ranges came with date variables)
    // Originally from https://github.com/VEuPathDB/web-eda/pull/1004
    // Only checking min for brevity.
    if (
      (Variable.is(variable) &&
        (min == null ||
          ((variable.type === 'number' || variable.type === 'integer') &&
            typeof min === 'number') ||
          (variable.type === 'date' && typeof min === 'string'))) ||
      ComputedVariableMetadata.is(variable)
    ) {
      const defaultRange = numberDateDefaultAxisRange(
        variable,
        min,
        minPos,
        max,
        logScale
      );

      // 4 significant figures
      if (
        Variable.is(variable) &&
        (variable.type === 'number' || variable.type === 'integer') &&
        typeof defaultRange?.min === 'number' &&
        typeof defaultRange?.max === 'number'
      )
        return {
          min: numberSignificantFiguresRoundDown(defaultRange.min, 4),
          max: numberSignificantFiguresRoundUp(defaultRange.max, 4),
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
            min: numberSignificantFiguresRoundDown(
              Math.min(minPos / 10, 0.1),
              4
            ), // ensure the minimum-height bars will be visible
            max: numberSignificantFiguresRoundUp(max, 4),
          }
        : {
            min: 0,
            max: numberSignificantFiguresRoundUp(max, 4),
          };
    } else {
      return undefined;
    }
  }, [variable, min, minPos, max, logScale]);
  return defaultAxisRange;
}
