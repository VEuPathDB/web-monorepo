import { NumberOrDateRange } from '@veupathdb/components/lib/types/general';
import { lt, lte } from 'lodash';

type UIState = {
  independentAxisRange?: NumberOrDateRange;
  dependentAxisRange?: NumberOrDateRange;
};

type Overrides = {
  truncationConfigIndependentAxisMin?: boolean;
  truncationConfigIndependentAxisMax?: boolean;
  truncationConfigDependentAxisMin?: boolean;
  truncationConfigDependentAxisMax?: boolean;
};

// compute truncation flags for both axes, min and max
// assumes default ranges are provided for both axes in the poorly named `defaultUIState`
// (poorly named because it often contains client-calculated ranges: e.g. barplot and histogram dependent axes)
// We should probably rename them "full ranges" or similar
export function truncationConfig(
  defaultUIState: UIState,
  uiState: UIState,
  overrides: Overrides = {},
  /** for the lower bound, is the truncation flag raised if
   * the user-range is less than OR EQUAL TO the 'defaultUIState' range min
   * which is what we want for bar plot and histogram bars
   */
  inclusiveDependentMin: boolean = false
) {
  const lessThan = inclusiveDependentMin ? lte : lt;

  const truncationConfigIndependentAxisMin =
    defaultUIState.independentAxisRange?.min != null &&
    uiState.independentAxisRange?.min != null &&
    defaultUIState.independentAxisRange.min < uiState.independentAxisRange.min
      ? true
      : false;
  const truncationConfigIndependentAxisMax =
    defaultUIState.independentAxisRange?.max != null &&
    uiState.independentAxisRange?.max != null &&
    defaultUIState.independentAxisRange.max > uiState.independentAxisRange.max
      ? true
      : false;
  const truncationConfigDependentAxisMin =
    defaultUIState.dependentAxisRange?.min != null &&
    uiState.dependentAxisRange?.min != null &&
    lessThan(
      defaultUIState.dependentAxisRange.min,
      uiState.dependentAxisRange.min
    )
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
    ...overrides,
  };
}
