import { UIState } from '../components/filter/HistogramFilter';

// function to compute truncation flags for Histogram-like
// visualizations (continuous x-axis with known bounds, y-axis showing non-negative counts)
export function truncationConfig(defaultUIState: UIState, uiState: UIState) {
  // check whether truncated axis is required
  const truncationConfigIndependentAxisMin =
    defaultUIState.independentAxisRange.min !==
      uiState.independentAxisRange.min &&
    defaultUIState.independentAxisRange.min < uiState.independentAxisRange.min
      ? true
      : false;
  const truncationConfigIndependentAxisMax =
    defaultUIState.independentAxisRange.max !==
      uiState.independentAxisRange.max &&
    defaultUIState.independentAxisRange.max > uiState.independentAxisRange.max
      ? true
      : false;
  const truncationConfigDependentAxisMin =
    uiState.dependentAxisRange?.min != null &&
    uiState.dependentAxisRange.min > 0
      ? true
      : false;
  const truncationConfigDependentAxisMax =
    uiState.dependentAxisRange?.max != null ? true : false;

  return {
    truncationConfigIndependentAxisMin,
    truncationConfigIndependentAxisMax,
    truncationConfigDependentAxisMin,
    truncationConfigDependentAxisMax,
  };
}
