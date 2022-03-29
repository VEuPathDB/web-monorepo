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
// type of computedVariableMetadata for computation apps such as alphadiv and abundance
import { ComputedVariableMetadata } from '../api/DataClient/types';

/**
 * A custom hook to compute default dependent axis range
 */

export function useDefaultDependentAxisRange(
  data: PromiseHookState<ScatterPlotDataWithCoverage | undefined>,
  vizConfig: ScatterplotConfig,
  updateVizConfig: (newConfig: Partial<ScatterplotConfig>) => void,
  yAxisVariable?: Variable,
  // use computedVariableMetadata for axis range of computation apps
  computedVariableMetadata?: ComputedVariableMetadata
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
      yMinMaxRange,
      // pass computedVariableMetadata
      computedVariableMetadata
    );

    // add a condition for computation apps
    return axisRangeMargin(
      defaultDependentRange,
      computedVariableMetadata != null ? 'number' : yAxisVariable?.type
    );
  }, [data, yAxisVariable, vizConfig.valueSpecConfig]);

  return defaultDependentAxisRange;
}
