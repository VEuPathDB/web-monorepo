import { UIState } from '../components/filter/HistogramFilter';
import { HistogramConfig } from '../components/visualizations/implementations/HistogramVisualization';
import { NumberRange } from '../types/general';

// function to compute truncation flags for Histogram-like
// visualizations (continuous x-axis with known bounds, y-axis showing non-negative counts)
export function truncationConfig(
  defaultUIState: UIState,
  vizConfig: HistogramConfig,
  defaultDependentAxisRange: NumberRange | undefined
) {
  // check whether truncated axis is required
  const truncationConfigIndependentAxisMin =
    vizConfig?.independentAxisRange?.min == null
      ? false
      : defaultUIState.independentAxisRange.min !==
          vizConfig.independentAxisRange.min &&
        defaultUIState.independentAxisRange.min <
          vizConfig.independentAxisRange.min
      ? true
      : false;
  const truncationConfigIndependentAxisMax =
    vizConfig?.independentAxisRange?.max == null
      ? false
      : defaultUIState.independentAxisRange.max !==
          vizConfig.independentAxisRange.max &&
        defaultUIState.independentAxisRange.max >
          vizConfig.independentAxisRange.max
      ? true
      : false;
  const truncationConfigDependentAxisMin =
    defaultDependentAxisRange?.min == null
      ? false
      : vizConfig?.dependentAxisRange?.min == null
      ? false
      : defaultDependentAxisRange.min != vizConfig.dependentAxisRange.min &&
        defaultDependentAxisRange.min < vizConfig.dependentAxisRange.min
      ? true
      : false;
  const truncationConfigDependentAxisMax =
    defaultDependentAxisRange?.max == null
      ? false
      : vizConfig.dependentAxisRange?.max == null
      ? false
      : defaultDependentAxisRange.max != vizConfig.dependentAxisRange.max &&
        defaultDependentAxisRange.max > vizConfig.dependentAxisRange.max;

  return {
    truncationConfigIndependentAxisMin,
    truncationConfigIndependentAxisMax,
    truncationConfigDependentAxisMin,
    truncationConfigDependentAxisMax,
  };
}
