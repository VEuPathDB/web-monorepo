import { UIState } from '../components/filter/HistogramFilter';
import { HistogramConfig } from '../components/visualizations/implementations/HistogramVisualization';
import { NumberRange } from '../types/general';
import { BarplotConfig } from '../components/visualizations/implementations/BarplotVisualization';
import { BoxplotConfig } from '../components/visualizations/implementations/BoxplotVisualization';

// function to compute truncation flags for Histogram-like
// visualizations (continuous x-axis with known bounds, y-axis showing non-negative counts)
export function truncationConfig(
  defaultUIState: UIState | undefined,
  vizConfig: HistogramConfig | BarplotConfig | BoxplotConfig,
  defaultDependentAxisRange: NumberRange | undefined
) {
  const truncationConfigIndependentAxisMin =
    defaultUIState == null
      ? false
      : (vizConfig as HistogramConfig)?.independentAxisRange?.min == null
      ? false
      : defaultUIState.independentAxisRange.min !==
          (vizConfig as HistogramConfig)?.independentAxisRange?.min &&
        defaultUIState.independentAxisRange.min <
          (vizConfig as HistogramConfig)?.independentAxisRange?.min!
      ? true
      : false;
  const truncationConfigIndependentAxisMax =
    defaultUIState == null
      ? false
      : (vizConfig as HistogramConfig)?.independentAxisRange?.max == null
      ? false
      : defaultUIState.independentAxisRange.max !==
          (vizConfig as HistogramConfig)?.independentAxisRange?.max &&
        defaultUIState.independentAxisRange.max >
          (vizConfig as HistogramConfig)?.independentAxisRange?.max!
      ? true
      : false;

  //DKDK set a hard-corded condition for histogram and barplot for dependentAxisRange.min for now
  const truncationConfigDependentAxisMin =
    defaultDependentAxisRange?.min == null
      ? false
      : vizConfig?.dependentAxisRange?.min == null
      ? false
      : defaultDependentAxisRange.min === 0 &&
        vizConfig.dependentAxisRange.min === 0.001
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
