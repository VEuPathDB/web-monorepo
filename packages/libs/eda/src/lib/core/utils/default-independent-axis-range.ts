import { Variable } from '../types/study';
import { NumberOrDateRange } from '@veupathdb/components/lib/types/general';

export function defaultIndependentAxisRange(
  variable: Variable | undefined
): NumberOrDateRange | undefined {
  if (variable != null && variable.dataShape === 'continuous') {
    if (variable.type === 'number') {
      return variable.displayRangeMin != null &&
        variable.displayRangeMax != null
        ? { min: variable.displayRangeMin, max: variable.displayRangeMax }
        : { min: Math.min(0, variable.rangeMin), max: variable.rangeMax };
    } else if (variable.type === 'date') {
      return variable.displayRangeMin != null &&
        variable.displayRangeMax != null
        ? {
            min: variable.displayRangeMin + 'T00:00:00Z',
            max: variable.displayRangeMax + 'T00:00:00Z',
          }
        : {
            min: variable.rangeMin + 'T00:00:00Z',
            max: variable.rangeMax + 'T00:00:00Z',
          };
    }
  } else return undefined;
}
