import { UIState } from '../components/filter/HistogramFilter';

// compute truncation flags for both axes, min and max
// assumes default ranges are provided for both axes in the poorly named `defaultUIState`
// (poorly named because it often contains client-calculated ranges: e.g. barplot and histogram dependent axes)
// We should probably rename them "full ranges" or similar
export function truncationConfig(defaultUIState: UIState, uiState: UIState) {
  // check whether truncated axis is required
  console.log(defaultUIState);

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
    defaultUIState.dependentAxisRange?.min != null &&
    uiState.dependentAxisRange?.min != null &&
    defaultUIState.dependentAxisRange.min < uiState.dependentAxisRange.min
      ? true
      : false;
  const truncationConfigDependentAxisMax =
    defaultUIState.dependentAxisRange?.max != null &&
    uiState.dependentAxisRange?.max != null &&
    defaultUIState.dependentAxisRange.max > uiState.dependentAxisRange.max
      ? true
      : false;

  return {
    truncationConfigIndependentAxisMin,
    truncationConfigIndependentAxisMax,
    truncationConfigDependentAxisMin,
    truncationConfigDependentAxisMax,
  };
}
