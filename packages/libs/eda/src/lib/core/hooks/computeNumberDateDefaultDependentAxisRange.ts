import { useMemo, useRef, useLayoutEffect } from 'react';
import { PromiseHookState } from './promise';
import {
  XYPlotDataWithCoverage,
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
  data: PromiseHookState<XYPlotDataWithCoverage | undefined>,
  vizConfig: ScatterplotConfig,
  updateVizConfig: (newConfig: Partial<ScatterplotConfig>) => void,
  yAxisVariable?: Variable
): NumberOrDateRange | undefined {
  // find max of stacked array, especially with overlayVariable
  const defaultDependentAxisRange = useMemo(() => {
    //K set yMinMaxRange using yMin/yMax obtained from processInputData()
    const yMinMaxRange =
      data.value != null
        ? { min: data.value.yMin, max: data.value?.yMax }
        : undefined;

    const defaultDependentRange = numberDateDefaultDependentAxisRange(
      yAxisVariable,
      'scatterplot',
      yMinMaxRange
    );

    return axisRangeMargin(defaultDependentRange, yAxisVariable?.type);
  }, [data, yAxisVariable, vizConfig.valueSpecConfig]);

  // use this to avoid infinite loop: also use useLayoutEffect to avoid async/ghost issue
  const updateVizConfigRef = useRef(updateVizConfig);
  useLayoutEffect(() => {
    updateVizConfigRef.current = updateVizConfig;
  }, [updateVizConfig]);

  // update vizConfig.dependentAxisRange as it is necessary for set range correctly
  useLayoutEffect(() => {
    if (!data.pending)
      updateVizConfigRef.current({
        dependentAxisRange: defaultDependentAxisRange,
      });
    else
      updateVizConfigRef.current({
        dependentAxisRange: undefined,
      });
  }, [data, defaultDependentAxisRange]);

  return defaultDependentAxisRange;
}
