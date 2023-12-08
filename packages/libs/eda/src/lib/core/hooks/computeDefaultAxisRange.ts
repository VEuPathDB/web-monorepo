import { useMemo } from 'react';
import { Variable } from '../types/study';
import { NumberOrDateRange } from '../types/general';
import { VariableMapping } from '../api/DataClient/types';
import { getDefaultAxisRange } from '../utils/computeDefaultAxisRange';

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
  axisRangeSpec = 'Full'
): NumberOrDateRange | undefined {
  return useMemo(
    () =>
      getDefaultAxisRange(variable, min, minPos, max, logScale, axisRangeSpec),
    [axisRangeSpec, logScale, max, min, minPos, variable]
  );
}
