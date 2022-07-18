import { useMemo } from 'react';
import { Variable } from '../types/study';
// for scatter plot
import { numberDateDefaultAxisRange } from '../utils/default-axis-range';
import { NumberOrDateRange } from '../types/general';
// type of computedVariableMetadata for computation apps such as alphadiv and abundance
import { ComputedVariableMetadata } from '../api/DataClient/types';
import { numberDecimalPoint } from '../utils/number-decimal-point';

/**
 * A custom hook to compute default axis range from annotated and observed min/max values
 * taking into account log scale, dates and computed variables
 */

export function useDefaultAxisRange(
  variable: Variable | ComputedVariableMetadata | undefined,
  /** the min/minPos/max values observed in the data response */
  min: number | string | undefined,
  minPos: number | string | undefined,
  max: number | string | undefined,
  /** are we using a log scale */
  logScale?: boolean
): NumberOrDateRange | undefined {
  //  console.log(`useDefaultAxisRange: min ${min} minPos ${minPos} max ${max} logScale ${logScale}`);
  const defaultAxisRange = useMemo(() => {
    // explicitly check empty data
    if (min == null && max == null) {
      return undefined;
    }

    // check whether variable type (number or date) matches the types of the min/max data extracted from the data
    if (
      (Variable.is(variable) &&
        (((variable.type === 'number' || variable.type === 'integer') &&
          typeof min === 'number' &&
          typeof max === 'number') ||
          (variable.type === 'date' &&
            typeof min === 'string' &&
            typeof max === 'string'))) ||
      ComputedVariableMetadata.is(variable)
    ) {
      const defaultRange = numberDateDefaultAxisRange(
        variable,
        min,
        minPos,
        max,
        logScale
      );

      // 4 decimal points
      if (
        Variable.is(variable) &&
        (variable.type === 'number' || variable.type === 'integer') &&
        typeof defaultRange?.min === 'number' &&
        typeof defaultRange?.max === 'number'
      )
        return {
          min: numberDecimalPoint(defaultRange.min, 4),
          max: numberDecimalPoint(defaultRange.max, 4),
        };
      else return defaultRange;
    } else {
      return undefined;
    }
  }, [variable, min, minPos, max, logScale]);

  return defaultAxisRange;
}
