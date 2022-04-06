import { useMemo } from 'react';
import { PromiseHookState } from './promise';
import {
  ScatterPlotDataWithCoverage,
  ScatterplotConfig,
} from '../components/visualizations/implementations/ScatterplotVisualization';
import { Variable } from '../types/study';
// for scatter plot
import { numberDateDefaultDependentAxisRange } from '../utils/default-dependent-axis-range';
import { axisRangeMargin } from '../utils/axis-range-margin';
import { NumberOrDateRange } from '../types/general';

/**
 * A custom hook to compute default dependent axis range
 */

export function useDefaultDependentAxisRange(
  data: PromiseHookState<ScatterPlotDataWithCoverage | undefined>,
  vizConfig: ScatterplotConfig,
  updateVizConfig: (newConfig: Partial<ScatterplotConfig>) => void,
  yAxisVariable?: Variable
): NumberOrDateRange | undefined {
  // find max of stacked array, especially with overlayVariable
  const defaultDependentAxisRange = useMemo(() => {
    // set yMinMaxRange using yMin/yMax obtained from processInputData()
    const yMinMaxRange =
      data.value != null
        ? { min: data.value.yMin, max: data.value?.yMax }
        : undefined;

    // check whether yAxisVariable.type and yMinMaxRange values match each other: checking string for date type would be sufficient
    if (
      ((yAxisVariable?.type === 'number' ||
        yAxisVariable?.type === 'integer') &&
        typeof yMinMaxRange?.min === 'number' &&
        typeof yMinMaxRange?.max === 'number') ||
      (yAxisVariable?.type === 'date' &&
        typeof yMinMaxRange?.min === 'string' &&
        typeof yMinMaxRange?.max === 'string')
    ) {
      const defaultDependentRange = numberDateDefaultDependentAxisRange(
        yAxisVariable,
        'scatterplot',
        yMinMaxRange
      );
      return axisRangeMargin(defaultDependentRange, yAxisVariable?.type);
    } else {
      return undefined;
    }
  }, [data, yAxisVariable, vizConfig.valueSpecConfig]);

  return defaultDependentAxisRange;
}
