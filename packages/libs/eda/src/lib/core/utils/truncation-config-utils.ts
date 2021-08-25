import { HistogramData } from '@veupathdb/components/lib/types/plots';
import { orderBy } from 'lodash';
import { UIState } from '../components/filter/HistogramFilter';

//DKDK function to compute min/max of dependent axis from data
export function dataDependentAxisMinMax(data?: HistogramData) {
  const dependentAxisMin: number | undefined =
    data?.series != null && data.series.length > 0
      ? orderBy(
          data.series.flatMap((series) => series.bins),
          [(bin) => bin.count],
          'asc'
        )[0].count
      : undefined;

  const dependentAxisMax: number | undefined =
    data?.series != null && data.series.length > 0
      ? orderBy(
          data.series.flatMap((series) => series.bins),
          [(bin) => bin.count],
          'desc'
        )[0].count
      : undefined;

  return { dependentAxisMin, dependentAxisMax };
}

//DKDK function to compute truncation flags
export function truncationConfig(
  defaultUIState: UIState,
  uiState: UIState,
  dependentAxisMin: number | undefined,
  dependentAxisMax: number | undefined
) {
  //DKDK check whether truncated axis is required
  const truncationConfigIndependentAxisMin =
    defaultUIState.independentAxisRange.min !== uiState.independentAxisRange.min
      ? true
      : false;
  const truncationConfigIndependentAxisMax =
    defaultUIState.independentAxisRange.max !== uiState.independentAxisRange.max
      ? true
      : false;
  const truncationConfigDependentAxisMin =
    uiState.dependentAxisRange?.min != null ||
    (dependentAxisMin != null &&
      uiState.defaultDependentAxisMin != null &&
      uiState.defaultDependentAxisMin !== dependentAxisMin)
      ? true
      : false;
  const truncationConfigDependentAxisMax =
    uiState.dependentAxisRange?.max != null ||
    (dependentAxisMax != null &&
      uiState.defaultDependentAxisMax != null &&
      uiState.defaultDependentAxisMax !== dependentAxisMax)
      ? true
      : false;

  return {
    truncationConfigIndependentAxisMin,
    truncationConfigIndependentAxisMax,
    truncationConfigDependentAxisMin,
    truncationConfigDependentAxisMax,
  };
}
